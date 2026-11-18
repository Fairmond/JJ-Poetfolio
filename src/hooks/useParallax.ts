import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseParallaxOptions {
  damping?: number;
  enableGyroscope?: boolean;
  maxDeflection?: number;
  tiltSensitivity?: number;
  mouseActiveRatio?: number;
  isLoaded?: boolean;
}

export interface ParallaxCoords {
  x: number;
  y: number;
}

export interface UseParallaxResult {
  renderPos: ParallaxCoords;
  targetPos: React.MutableRefObject<ParallaxCoords>;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseLeave: () => void;
  resetTarget: () => void;
  calibrateOrigin: () => void;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function clampToCircle(x: number, y: number, maxRadius: number): ParallaxCoords {
  const dist = Math.hypot(x, y);
  if (dist <= maxRadius || dist === 0) {
    return { x, y };
  }
  const scale = maxRadius / dist;
  return { x: x * scale, y: y * scale };
}

/**
 * Build 3x3 W3C DeviceOrientation rotation matrix R = Rz(alpha) * Rx(beta) * Ry(gamma)
 * stored row-major as a 9-element tuple.
 */
function buildW3CMatrix(alpha: number, beta: number, gamma: number): number[] {
  const a = alpha * DEG_TO_RAD;
  const b = beta * DEG_TO_RAD;
  const g = gamma * DEG_TO_RAD;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  const cg = Math.cos(g);
  const sg = Math.sin(g);

  return [
    ca * cg - sa * sb * sg,
    -cb * sa,
    ca * sg + cg * sa * sb,
    cg * sa + ca * sb * sg,
    ca * cb,
    sa * sg - ca * cg * sb,
    -cb * sg,
    sb,
    cb * cg,
  ];
}

function buildMatrixFromQuaternion(qx: number, qy: number, qz: number, qw: number): number[] {
  return [
    1 - 2 * (qy * qy + qz * qz),
    2 * (qx * qy - qw * qz),
    2 * (qx * qz + qw * qy),
    2 * (qx * qy + qw * qz),
    1 - 2 * (qx * qx + qz * qz),
    2 * (qy * qz - qw * qx),
    2 * (qx * qz - qw * qy),
    2 * (qy * qz + qw * qx),
    1 - 2 * (qx * qx + qy * qy),
  ];
}

interface GravityBasis {
  rx: number;
  ry: number;
  rz: number;
  px: number;
  py: number;
  pz: number;
}

function buildGravityBasis(ux: number, uy: number, uz: number): GravityBasis {
  let rx = 1 - ux * ux;
  let ry = -ux * uy;
  let rz = -ux * uz;
  let rLen = Math.hypot(rx, ry, rz);
  if (rLen < 1e-3) {
    rx = 0;
    ry = 0;
    rz = ux >= 0 ? -1 : 1;
    rLen = 1;
  }
  rx /= rLen;
  ry /= rLen;
  rz /= rLen;

  const px = uy * rz - uz * ry;
  const py = uz * rx - ux * rz;
  const pz = ux * ry - uy * rx;
  return { rx, ry, rz, px, py, pz };
}

/**
 * High-performance parallax physics hook with inertia / lerp damping loop,
 * cross-browser gyroscope + smoothed gravity fallback tracking, circular radial clamping,
 * and post-load origin calibration.
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxResult {
  const {
    damping = 0.11,
    enableGyroscope = false,
    maxDeflection = 1,
    tiltSensitivity = 20,
    mouseActiveRatio = 0.6,
    isLoaded = true,
  } = options;

  const [renderPos, setRenderPos] = useState<ParallaxCoords>({ x: 0, y: 0 });
  const targetPos = useRef<ParallaxCoords>({ x: 0, y: 0 });
  const currentPos = useRef<ParallaxCoords>({ x: 0, y: 0 });

  const originMatrixRef = useRef<number[] | null>(null);
  const gravityBasisRef = useRef<GravityBasis | null>(null);
  const smoothedTiltRef = useRef<ParallaxCoords | null>(null);
  const needsCalibrationRef = useRef<boolean>(true);
  const iosPermissionGrantedRef = useRef<boolean>(false);

  const calibrateOrigin = useCallback(() => {
    needsCalibrationRef.current = true;
    smoothedTiltRef.current = null;
  }, []);

  // Re-zero gyroscope baseline once initial asset preloading finishes
  useEffect(() => {
    if (isLoaded) {
      calibrateOrigin();
    }
  }, [isLoaded, calibrateOrigin]);

  // Inertia / damping rAF loop (skips React state updates when resting)
  useEffect(() => {
    let animId: number;
    let lastRenderedX = currentPos.current.x;
    let lastRenderedY = currentPos.current.y;

    const tick = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * damping;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * damping;

      if (
        Math.abs(currentPos.current.x - lastRenderedX) > 0.0001 ||
        Math.abs(currentPos.current.y - lastRenderedY) > 0.0001
      ) {
        lastRenderedX = currentPos.current.x;
        lastRenderedY = currentPos.current.y;
        setRenderPos({
          x: currentPos.current.x,
          y: currentPos.current.y,
        });
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [damping]);

  // Desktop mouse parallax (reaches full radius within center mouseActiveRatio circle)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (enableGyroscope) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const safeRatio = mouseActiveRatio > 0 ? mouseActiveRatio : 1;
      const rawX = (((e.clientX - rect.left) / rect.width - 0.5) * 2) / safeRatio;
      const rawY = (((e.clientY - rect.top) / rect.height - 0.5) * 2) / safeRatio;
      targetPos.current = clampToCircle(rawX, rawY, maxDeflection);
    },
    [enableGyroscope, maxDeflection, mouseActiveRatio],
  );

  const handleMouseLeave = useCallback(() => {
    if (enableGyroscope) return;
    targetPos.current = { x: 0, y: 0 };
  }, [enableGyroscope]);

  const resetTarget = useCallback(() => {
    targetPos.current = { x: 0, y: 0 };
  }, []);

  // Mobile gyroscope / orientation + smoothed gravity fallback
  useEffect(() => {
    if (!enableGyroscope || typeof window === 'undefined') return;

    originMatrixRef.current = null;
    gravityBasisRef.current = null;
    smoothedTiltRef.current = null;
    needsCalibrationRef.current = true;

    const mountTime = Date.now();
    let hasStandardOrientation = false;
    let hasOrientationEvent = false;
    let hasMotionEvent = false;

    const applyContinuousTilt = (rawDxDeg: number, rawDyDeg: number) => {
      const prev = smoothedTiltRef.current ?? { x: rawDxDeg, y: rawDyDeg };
      const emaAlpha = 0.6;
      const smoothX = prev.x + (rawDxDeg - prev.x) * emaAlpha;
      const smoothY = prev.y + (rawDyDeg - prev.y) * emaAlpha;
      smoothedTiltRef.current = { x: smoothX, y: smoothY };

      targetPos.current = clampToCircle(
        smoothX / tiltSensitivity,
        smoothY / tiltSensitivity,
        maxDeflection,
      );
    };

    const applyRotationMatrix = (m: number[]) => {
      if (needsCalibrationRef.current || originMatrixRef.current === null) {
        originMatrixRef.current = m;
        gravityBasisRef.current = null;
        smoothedTiltRef.current = { x: 0, y: 0 };
        needsCalibrationRef.current = false;
        targetPos.current = { x: 0, y: 0 };
        return;
      }

      const m0 = originMatrixRef.current;
      // Col 2 (screen normal) and Col 1 (screen top axis)
      const zx = m[2], zy = m[5], zz = m[8];
      const yx = m[1], yy = m[4], yz = m[7];

      const rx = m0[0] * zx + m0[3] * zy + m0[6] * zz;
      const ry = m0[1] * zx + m0[4] * zy + m0[7] * zz;
      const rz = m0[2] * zx + m0[5] * zy + m0[8] * zz;
      const rel01 = m0[0] * yx + m0[3] * yy + m0[6] * yz;

      const xMix = Math.max(-1, Math.min(1, rx + m0[7] * rel01));

      let rawDxDeg: number;
      let rawDyDeg: number;
      if (rz < 0 && Math.abs(ry) > Math.abs(rx)) {
        rawDxDeg = Math.atan2(rx, -rz) * RAD_TO_DEG;
        rawDyDeg = Math.atan2(-ry, rz) * RAD_TO_DEG;
      } else if (rz < 0 && Math.abs(rx) >= Math.abs(ry)) {
        rawDxDeg = Math.atan2(rx, rz) * RAD_TO_DEG;
        rawDyDeg = -Math.asin(Math.max(-1, Math.min(1, ry))) * RAD_TO_DEG;
      } else {
        rawDxDeg = Math.asin(xMix) * RAD_TO_DEG;
        rawDyDeg = -Math.asin(Math.max(-1, Math.min(1, ry))) * RAD_TO_DEG;
      }

      applyContinuousTilt(rawDxDeg, rawDyDeg);
    };

    const applyGravityVector = (rawUx: number, rawUy: number, rawUz: number) => {
      const len = Math.hypot(rawUx, rawUy, rawUz);
      if (len < 1e-4) return;
      const ux = rawUx / len;
      const uy = rawUy / len;
      const uz = rawUz / len;

      if (needsCalibrationRef.current || gravityBasisRef.current === null) {
        gravityBasisRef.current = buildGravityBasis(ux, uy, uz);
        smoothedTiltRef.current = { x: 0, y: 0 };
        needsCalibrationRef.current = false;
        targetPos.current = { x: 0, y: 0 };
        return;
      }

      const b = gravityBasisRef.current;
      const projX = Math.max(-1, Math.min(1, ux * b.rx + uy * b.ry + uz * b.rz));
      const projY = Math.max(-1, Math.min(1, ux * b.px + uy * b.py + uz * b.pz));
      applyContinuousTilt(Math.asin(projX) * RAD_TO_DEG, Math.asin(projY) * RAD_TO_DEG);
    };

    const processOrientation = (e: DeviceOrientationEvent, isAbsoluteFallback: boolean) => {
      if (isAbsoluteFallback && hasStandardOrientation) return;

      const { alpha: rawA, beta: b, gamma: g } = e;
      if (typeof b !== 'number' || typeof g !== 'number' || Number.isNaN(b) || Number.isNaN(g)) {
        return;
      }

      const a = typeof rawA === 'number' && !Number.isNaN(rawA) ? rawA : 0;
      if (!hasOrientationEvent && b === 0 && g === 0 && a === 0) {
        return;
      }

      if (!isAbsoluteFallback) {
        hasStandardOrientation = true;
      }
      if (!hasOrientationEvent) {
        hasOrientationEvent = true;
        needsCalibrationRef.current = true;
      }

      applyRotationMatrix(buildW3CMatrix(a, b, g));
    };

    const handleStandard = (e: DeviceOrientationEvent) => processOrientation(e, false);
    const handleAbsolute = (e: Event) => processOrientation(e as DeviceOrientationEvent, true);

    // Tier 2 fallback: low-pass filtered gravity vector from devicemotion (for Android WebViews / browsers
    // where deviceorientation emits nulls or stays inactive while accelerationIncludingGravity streams)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let lpAcc: { x: number; y: number; z: number } | null = null;
    let motionWarmupCount = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (hasOrientationEvent) return;
      // Wait briefly for deviceorientation to take priority before engaging devicemotion fallback
      if (Date.now() - mountTime < 450) return;

      const acc = e.accelerationIncludingGravity;
      if (
        !acc ||
        typeof acc.x !== 'number' ||
        typeof acc.y !== 'number' ||
        typeof acc.z !== 'number' ||
        Number.isNaN(acc.x) ||
        Number.isNaN(acc.y) ||
        Number.isNaN(acc.z)
      ) {
        return;
      }

      const gLen = Math.hypot(acc.x, acc.y, acc.z);
      if (gLen < 1) return;

      const sign = isIOS ? -1 : 1;
      const nx = -acc.x * sign;
      const ny = acc.y * sign;
      const nz = acc.z * sign;

      if (lpAcc === null) {
        lpAcc = { x: nx, y: ny, z: nz };
        motionWarmupCount = 1;
        return;
      }

      // Gravity low-pass filter (lpAlpha = 0.12) strips out hand tremor & linear acceleration
      const lpAlpha = 0.12;
      lpAcc.x += (nx - lpAcc.x) * lpAlpha;
      lpAcc.y += (ny - lpAcc.y) * lpAlpha;
      lpAcc.z += (nz - lpAcc.z) * lpAlpha;
      motionWarmupCount += 1;

      if (motionWarmupCount < 3) return;
      if (!hasMotionEvent) {
        hasMotionEvent = true;
        needsCalibrationRef.current = true;
      }
      applyGravityVector(lpAcc.x, lpAcc.y, lpAcc.z);
    };

    // Tier 3 fallback: W3C hardware-fused Generic Sensors (RelativeOrientationSensor / GravitySensor only, never raw Accelerometer)
    interface GenericSensorLike {
      start: () => void;
      stop: () => void;
      addEventListener: (type: string, cb: () => void) => void;
      quaternion?: number[];
      x?: number;
      y?: number;
      z?: number;
    }
    type SensorConstructor = new (opts?: { frequency?: number }) => GenericSensorLike;
    let activeGenericSensor: GenericSensorLike | null = null;

    const stopGenericSensor = () => {
      if (activeGenericSensor) {
        try {
          activeGenericSensor.stop();
        } catch {
          // Ignore stop errors
        }
        activeGenericSensor = null;
      }
    };

    const startGenericSensorFallback = () => {
      if (hasOrientationEvent || hasMotionEvent || activeGenericSensor) return;
      const win = window as unknown as Record<string, SensorConstructor | undefined>;

      const tryOrientationSensor = (Ctor: SensorConstructor | undefined): boolean => {
        if (!Ctor) return false;
        try {
          const sensor = new Ctor({ frequency: 60 });
          sensor.addEventListener('reading', () => {
            if (hasOrientationEvent || hasMotionEvent) {
              stopGenericSensor();
              return;
            }
            const q = sensor.quaternion;
            if (!q || q.length < 4) return;
            applyRotationMatrix(buildMatrixFromQuaternion(q[0], q[1], q[2], q[3]));
          });
          sensor.addEventListener('error', stopGenericSensor);
          sensor.start();
          activeGenericSensor = sensor;
          return true;
        } catch {
          return false;
        }
      };

      const tryGravitySensor = (Ctor: SensorConstructor | undefined): boolean => {
        if (!Ctor) return false;
        try {
          const sensor = new Ctor({ frequency: 60 });
          sensor.addEventListener('reading', () => {
            if (hasOrientationEvent || hasMotionEvent) {
              stopGenericSensor();
              return;
            }
            const { x: gx, y: gy, z: gz } = sensor;
            if (typeof gx !== 'number' || typeof gy !== 'number' || typeof gz !== 'number') return;
            applyGravityVector(-gx, gy, gz);
          });
          sensor.addEventListener('error', stopGenericSensor);
          sensor.start();
          activeGenericSensor = sensor;
          return true;
        } catch {
          return false;
        }
      };

      if (tryOrientationSensor(win.RelativeOrientationSensor)) return;
      if (tryOrientationSensor(win.AbsoluteOrientationSensor)) return;
      tryGravitySensor(win.GravitySensor);
    };

    const attach = () => {
      window.addEventListener('deviceorientation', handleStandard, false);
      window.addEventListener('deviceorientationabsolute', handleAbsolute, false);
      window.addEventListener('devicemotion', handleDeviceMotion, false);
    };

    const detach = () => {
      window.removeEventListener('deviceorientation', handleStandard, false);
      window.removeEventListener('deviceorientationabsolute', handleAbsolute, false);
      window.removeEventListener('devicemotion', handleDeviceMotion, false);
      stopGenericSensor();
    };

    attach();

    const genericTimer = window.setTimeout(startGenericSensorFallback, 900);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        calibrateOrigin();
      }
    };
    window.addEventListener('pageshow', calibrateOrigin);
    document.addEventListener('visibilitychange', handleVisibility);

    // iOS Safari 13+ requires requestPermission() inside a user 'click' gesture
    const doe =
      typeof DeviceOrientationEvent !== 'undefined'
        ? (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        : undefined;
    const dme =
      typeof DeviceMotionEvent !== 'undefined'
        ? (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
        : undefined;
    const reqFn =
      doe && typeof doe.requestPermission === 'function'
        ? doe.requestPermission.bind(DeviceOrientationEvent)
        : dme && typeof dme.requestPermission === 'function'
          ? dme.requestPermission.bind(DeviceMotionEvent)
          : null;

    let permissionStatus: 'idle' | 'pending' | 'granted' | 'denied' = iosPermissionGrantedRef.current
      ? 'granted'
      : 'idle';
    const prevBodyCursor = document.body?.style.cursor ?? '';

    const restoreCursor = () => {
      if (document.body) {
        document.body.style.cursor = prevBodyCursor;
      }
    };

    const requestPermissionOnClick = () => {
      if (!reqFn || permissionStatus === 'pending' || permissionStatus === 'granted') return;

      permissionStatus = 'pending';
      reqFn()
        .then((state) => {
          if (state === 'granted') {
            permissionStatus = 'granted';
            iosPermissionGrantedRef.current = true;
            restoreCursor();
            detach();
            attach();
            calibrateOrigin();
            document.removeEventListener('click', requestPermissionOnClick, true);
          } else {
            permissionStatus = 'denied';
            restoreCursor();
          }
        })
        .catch(() => {
          permissionStatus = 'idle';
        });
    };

    if (reqFn && !iosPermissionGrantedRef.current) {
      if (document.body) {
        document.body.style.cursor = 'pointer';
      }
      document.addEventListener('click', requestPermissionOnClick, { capture: true, passive: true });
    }

    return () => {
      window.clearTimeout(genericTimer);
      window.removeEventListener('pageshow', calibrateOrigin);
      document.removeEventListener('visibilitychange', handleVisibility);
      detach();
      if (reqFn) {
        restoreCursor();
        document.removeEventListener('click', requestPermissionOnClick, true);
      }
    };
  }, [enableGyroscope, maxDeflection, tiltSensitivity, calibrateOrigin]);

  return {
    renderPos,
    targetPos,
    handleMouseMove,
    handleMouseLeave,
    resetTarget,
    calibrateOrigin,
  };
}
