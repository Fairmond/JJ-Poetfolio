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
 * cross-browser gyroscope + smoothed gravity fallback + async GenericSensor chain,
 * circular radial clamping, and post-load origin calibration.
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
  const onPostLoadReadyRef = useRef<(() => void) | null>(null);
  const isLoadedRef = useRef<boolean>(isLoaded);
  isLoadedRef.current = isLoaded;

  const calibrateOrigin = useCallback(() => {
    needsCalibrationRef.current = true;
    smoothedTiltRef.current = null;
  }, []);

  // Re-zero gyroscope baseline and verify active sensor stream once asset preloading finishes
  useEffect(() => {
    if (isLoaded) {
      calibrateOrigin();
      onPostLoadReadyRef.current?.();
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

  // Mobile gyroscope / orientation + smoothed gravity + async GenericSensor fallback
  useEffect(() => {
    if (!enableGyroscope || typeof window === 'undefined') return;

    originMatrixRef.current = null;
    gravityBasisRef.current = null;
    smoothedTiltRef.current = null;
    needsCalibrationRef.current = true;

    let hasStandardOrientation = false;
    let firstOrientation: { a: number; b: number; g: number } | null = null;
    let hasMovingOrientation = false;
    let hasMovingMotion = false;
    let hasMovingGeneric = false;
    let activeSource: 'none' | 'orientation' | 'motion' | 'generic' = 'none';

    const hasAnyMovingSensor = () =>
      hasMovingOrientation || hasMovingMotion || hasMovingGeneric;

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

    const applyRotationMatrix = (source: 'orientation' | 'generic', m: number[]) => {
      if (activeSource !== source) {
        activeSource = source;
        needsCalibrationRef.current = true;
      }

      if (needsCalibrationRef.current || originMatrixRef.current === null) {
        originMatrixRef.current = m;
        gravityBasisRef.current = null;
        smoothedTiltRef.current = { x: 0, y: 0 };
        needsCalibrationRef.current = false;
        targetPos.current = { x: 0, y: 0 };
        return;
      }

      const m0 = originMatrixRef.current;
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

    const applyGravityVector = (
      source: 'motion' | 'generic',
      rawUx: number,
      rawUy: number,
      rawUz: number,
    ) => {
      const len = Math.hypot(rawUx, rawUy, rawUz);
      if (len < 1e-4) return;
      const ux = rawUx / len;
      const uy = rawUy / len;
      const uz = rawUz / len;

      if (activeSource !== source) {
        activeSource = source;
        needsCalibrationRef.current = true;
      }

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

      if (!hasMovingOrientation) {
        if (b === 0 && g === 0 && a === 0) return;
        if (!firstOrientation) {
          firstOrientation = { a, b, g };
          if (!isAbsoluteFallback) hasStandardOrientation = true;
          applyRotationMatrix('orientation', buildW3CMatrix(a, b, g));
          return;
        }
        const delta =
          Math.abs(a - firstOrientation.a) +
          Math.abs(b - firstOrientation.b) +
          Math.abs(g - firstOrientation.g);
        if (delta > 0.05) {
          hasMovingOrientation = true;
        } else {
          return;
        }
      }

      if (!isAbsoluteFallback) {
        hasStandardOrientation = true;
      }

      applyRotationMatrix('orientation', buildW3CMatrix(a, b, g));
    };

    const handleStandard = (e: DeviceOrientationEvent) => processOrientation(e, false);
    const handleAbsolute = (e: Event) => processOrientation(e as DeviceOrientationEvent, true);

    // Tier 2 fallback: low-pass filtered gravity vector from devicemotion
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let lpAcc: { x: number; y: number; z: number } | null = null;
    let firstMotionNorm: { x: number; y: number; z: number } | null = null;
    let motionWarmupCount = 0;
    let motionWaitStart = Date.now();

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (hasMovingOrientation) return;
      if (Date.now() - motionWaitStart < 350) return;

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

      const lpAlpha = 0.12;
      lpAcc.x += (nx - lpAcc.x) * lpAlpha;
      lpAcc.y += (ny - lpAcc.y) * lpAlpha;
      lpAcc.z += (nz - lpAcc.z) * lpAlpha;
      motionWarmupCount += 1;

      if (motionWarmupCount < 3) return;

      const lLen = Math.hypot(lpAcc.x, lpAcc.y, lpAcc.z) || 1;
      const ux = lpAcc.x / lLen;
      const uy = lpAcc.y / lLen;
      const uz = lpAcc.z / lLen;

      if (!hasMovingMotion) {
        if (!firstMotionNorm) {
          firstMotionNorm = { x: ux, y: uy, z: uz };
        } else if (
          Math.hypot(
            ux - firstMotionNorm.x,
            uy - firstMotionNorm.y,
            uz - firstMotionNorm.z,
          ) > 0.002
        ) {
          hasMovingMotion = true;
        }
      }

      applyGravityVector('motion', lpAcc.x, lpAcc.y, lpAcc.z);
    };

    // Tier 3 fallback: asynchronous W3C hardware-fused Generic Sensor chain (never raw Accelerometer)
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
    let genericProbeTimer: number | null = null;
    let genericAttemptIndex = 0;

    const stopGenericSensor = () => {
      if (genericProbeTimer !== null) {
        window.clearTimeout(genericProbeTimer);
        genericProbeTimer = null;
      }
      if (activeGenericSensor) {
        try {
          activeGenericSensor.stop();
        } catch {
          // Ignore stop errors
        }
        activeGenericSensor = null;
      }
    };

    const tryNextGenericSensor = () => {
      if (hasMovingOrientation || hasMovingMotion || activeGenericSensor) return;
      const win = window as unknown as Record<string, SensorConstructor | undefined>;

      const candidates: Array<{
        ctor: SensorConstructor | undefined;
        kind: 'orientation' | 'gravity';
      }> = [
        { ctor: win.RelativeOrientationSensor, kind: 'orientation' },
        { ctor: win.AbsoluteOrientationSensor, kind: 'orientation' },
        { ctor: win.GravitySensor, kind: 'gravity' },
      ];

      while (genericAttemptIndex < candidates.length) {
        const candidate = candidates[genericAttemptIndex++];
        if (!candidate.ctor) continue;

        try {
          const sensor = new candidate.ctor({ frequency: 60 });
          let gotReading = false;

          const advanceOnFailure = () => {
            if (gotReading) return;
            stopGenericSensor();
            tryNextGenericSensor();
          };

          sensor.addEventListener('reading', () => {
            if (hasMovingOrientation || hasMovingMotion) {
              stopGenericSensor();
              return;
            }
            gotReading = true;
            hasMovingGeneric = true;
            if (genericProbeTimer !== null) {
              window.clearTimeout(genericProbeTimer);
              genericProbeTimer = null;
            }
            if (candidate.kind === 'orientation') {
              const q = sensor.quaternion;
              if (!q || q.length < 4) return;
              applyRotationMatrix('generic', buildMatrixFromQuaternion(q[0], q[1], q[2], q[3]));
            } else {
              const { x: gx, y: gy, z: gz } = sensor;
              if (typeof gx !== 'number' || typeof gy !== 'number' || typeof gz !== 'number') return;
              applyGravityVector('generic', -gx, gy, gz);
            }
          });

          sensor.addEventListener('error', advanceOnFailure);
          sensor.start();
          activeGenericSensor = sensor;

          // If this sensor produces no reading within 500ms, advance cleanly to the next candidate
          genericProbeTimer = window.setTimeout(advanceOnFailure, 500);
          return;
        } catch {
          // Synchronous construct/start failure: continue to next candidate
        }
      }
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

    let fallbackTimer: number | null = window.setTimeout(() => {
      fallbackTimer = null;
      if (!hasMovingOrientation && !hasMovingMotion) {
        tryNextGenericSensor();
      }
    }, 800);

    // Post-load & gesture wake-up ONLY when no changing sensor stream is active yet (fixes slow-load browser stalls)
    const wakeSensorsIfIdle = () => {
      if (hasAnyMovingSensor()) return;
      motionWaitStart = Date.now() - 350;
      detach();
      attach();
      genericAttemptIndex = 0;
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
      fallbackTimer = window.setTimeout(() => {
        fallbackTimer = null;
        if (!hasMovingOrientation && !hasMovingMotion) {
          tryNextGenericSensor();
        }
      }, 450);
    };

    onPostLoadReadyRef.current = wakeSensorsIfIdle;
    if (isLoadedRef.current) {
      wakeSensorsIfIdle();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        calibrateOrigin();
        wakeSensorsIfIdle();
      }
    };
    window.addEventListener('load', wakeSensorsIfIdle);
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

    const wakeOnFirstTouch = () => {
      if (hasAnyMovingSensor()) {
        document.removeEventListener('pointerdown', wakeOnFirstTouch, true);
        return;
      }
      wakeSensorsIfIdle();
    };

    if (reqFn && !iosPermissionGrantedRef.current) {
      if (document.body) {
        document.body.style.cursor = 'pointer';
      }
      document.addEventListener('click', requestPermissionOnClick, { capture: true, passive: true });
    } else if (!reqFn) {
      document.addEventListener('pointerdown', wakeOnFirstTouch, { capture: true, passive: true });
    }

    return () => {
      onPostLoadReadyRef.current = null;
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
      window.removeEventListener('load', wakeSensorsIfIdle);
      window.removeEventListener('pageshow', calibrateOrigin);
      document.removeEventListener('visibilitychange', handleVisibility);
      detach();
      if (reqFn) {
        restoreCursor();
        document.removeEventListener('click', requestPermissionOnClick, true);
      } else {
        document.removeEventListener('pointerdown', wakeOnFirstTouch, true);
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
