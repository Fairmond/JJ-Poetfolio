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
  handlePointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  handleMouseLeave: () => void;
  resetTarget: () => void;
  calibrateOrigin: () => void;
}

/**
 * High-performance parallax physics hook with inertia / lerp damping loop,
 * dynamic post-load gyroscope origin calibration, square axis-independent clamping,
 * and robust cross-platform device orientation support.
 */
function clampToSquare(x: number, y: number, limit: number): ParallaxCoords {
  return {
    x: Math.max(-limit, Math.min(limit, x)),
    y: Math.max(-limit, Math.min(limit, y)),
  };
}

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

  // Calibrated origin: baseline 3D unit gravity vector & tangent basis captured upon load completion
  const originBasisRef = useRef<{
    ux: number;
    uy: number;
    uz: number;
    rx: number;
    ry: number;
    rz: number;
    px: number;
    py: number;
    pz: number;
  } | null>(null);
  const needsCalibration = useRef<boolean>(true);

  const calibrateOrigin = useCallback(() => {
    needsCalibration.current = true;
  }, []);

  // When page finishes loading (isLoaded becomes true), trigger origin calibration
  useEffect(() => {
    if (isLoaded) {
      needsCalibration.current = true;
    }
  }, [isLoaded]);

  // Inertia / Damping lerp loop (skip redundant React state updates when resting to keep slow loads smooth)
  useEffect(() => {
    let animId: number;
    let lastRenderedX = currentPos.current.x;
    let lastRenderedY = currentPos.current.y;

    const update = () => {
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

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [damping]);

  // Track real moving sensor activity & active sensor source refs
  const lastGyroEventTime = useRef<number>(0);
  const lastSensorVector = useRef<{ ux: number; uy: number; uz: number } | null>(null);
  const hasStandardOrientation = useRef<boolean>(false);
  const hasAnyOrientation = useRef<boolean>(false);
  const receivedValidLegacySensorRef = useRef<boolean>(false);
  const iosPermissionGrantedRef = useRef<boolean>(false);
  const ensurePostLoadSensorsRef = useRef<(() => void) | null>(null);
  const isLoadedRef = useRef<boolean>(isLoaded);
  isLoadedRef.current = isLoaded;

  // When page finishes loading (isLoaded becomes true), trigger origin calibration and verify sensor stream
  useEffect(() => {
    if (isLoaded) {
      needsCalibration.current = true;
      ensurePostLoadSensorsRef.current?.();
    }
  }, [isLoaded]);

  const updateTargetFromClientXY = useCallback(
    (clientX: number, clientY: number, currentTarget: HTMLElement) => {
      const rect = currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const safeRatio = mouseActiveRatio > 0 ? mouseActiveRatio : 1;
      const rawX = (((clientX - rect.left) / rect.width - 0.5) * 2) / safeRatio;
      const rawY = (((clientY - rect.top) / rect.height - 0.5) * 2) / safeRatio;
      targetPos.current = clampToSquare(rawX, rawY, maxDeflection);
    },
    [maxDeflection, mouseActiveRatio],
  );

  // Mouse move handler (PC / Desktop preview) - reaches full radius within center 60% area, angle-only beyond
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // Ignore synthetic mousemove synthesized from touch taps on mobile browsers
      const nativeEvt = e.nativeEvent as MouseEvent & {
        sourceCapabilities?: { firesTouchEvents?: boolean };
      };
      if (nativeEvt.sourceCapabilities?.firesTouchEvents) return;

      // Do not let mouse hover overwrite active moving gyroscope readings
      if (enableGyroscope && Date.now() - lastGyroEventTime.current < 3000) return;

      updateTargetFromClientXY(e.clientX, e.clientY, e.currentTarget);
    },
    [enableGyroscope, updateTargetFromClientXY],
  );

  // Pointer move handler (supports desktop mouse, pen, and DevTools touch-drag preview when gyro is inactive)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (enableGyroscope && Date.now() - lastGyroEventTime.current < 3000) return;
      if (e.pointerType === 'touch' && !enableGyroscope) return;
      updateTargetFromClientXY(e.clientX, e.clientY, e.currentTarget);
    },
    [enableGyroscope, updateTargetFromClientXY],
  );

  const handleMouseLeave = useCallback(() => {
    if (enableGyroscope && Date.now() - lastGyroEventTime.current < 3000) return;
    targetPos.current = { x: 0, y: 0 };
  }, [enableGyroscope]);

  const resetTarget = useCallback(() => {
    targetPos.current = { x: 0, y: 0 };
  }, []);

  // Gyroscope / Device orientation + Motion fallback (Mobile) - clamped within circular radial area
  useEffect(() => {
    if (!enableGyroscope || typeof window === 'undefined') return;

    hasStandardOrientation.current = false;
    hasAnyOrientation.current = false;
    receivedValidLegacySensorRef.current = false;
    lastSensorVector.current = null;
    originBasisRef.current = null;
    let activeSource: 'none' | 'orientation' | 'motion' | 'generic' = 'none';
    const mountTime = Date.now();
    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;

    const buildTangentBasis = (ux: number, uy: number, uz: number) => {
      // Project device screen-right axis (1, 0, 0) onto plane perpendicular to baseline up-vector u0
      let rx = 1 - ux * ux;
      let ry = -ux * uy;
      let rz = -ux * uz;
      let rLen = Math.hypot(rx, ry, rz);
      if (rLen < 1e-3) {
        // Phone calibrated nearly sideways on its edge: fall back to screen-normal axis
        rx = 0;
        ry = 0;
        rz = ux >= 0 ? -1 : 1;
        rLen = 1;
      }
      rx /= rLen;
      ry /= rLen;
      rz /= rLen;

      // Pitch axis = u0 x eRight (unit vector orthogonal to both u0 and eRight)
      const px = uy * rz - uz * ry;
      const py = uz * rx - ux * rz;
      const pz = ux * ry - uy * rx;

      return { ux, uy, uz, rx, ry, rz, px, py, pz };
    };

    const updateTargetFromUnitVector = (
      source: 'orientation' | 'motion' | 'generic',
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
        needsCalibration.current = true;
      }

      if (
        lastSensorVector.current &&
        Math.hypot(
          ux - lastSensorVector.current.ux,
          uy - lastSensorVector.current.uy,
          uz - lastSensorVector.current.uz,
        ) > 0.0026
      ) {
        lastGyroEventTime.current = Date.now();
      }
      lastSensorVector.current = { ux, uy, uz };

      // Capture calibrated baseline posture on first sample or post-load reset
      if (needsCalibration.current || originBasisRef.current === null) {
        originBasisRef.current = buildTangentBasis(ux, uy, uz);
        needsCalibration.current = false;
      }

      const basis = originBasisRef.current;
      // Spherical great-circle angle (0°..180°) from calibrated origin, completely free of Euler gimbal lock & ±90° wraps
      const dot = Math.max(-1, Math.min(1, ux * basis.ux + uy * basis.uy + uz * basis.uz));
      const thetaDeg = Math.acos(dot) * RAD_TO_DEG;

      if (thetaDeg < 1e-4) {
        targetPos.current = { x: 0, y: 0 };
        return;
      }

      const projX = ux * basis.rx + uy * basis.ry + uz * basis.rz;
      const projY = ux * basis.px + uy * basis.py + uz * basis.pz;
      const projMag = Math.hypot(projX, projY);

      if (projMag < 1e-6) {
        if (dot > 0) {
          targetPos.current = { x: 0, y: 0 };
        }
        return;
      }

      const deltaXDeg = (thetaDeg * projX) / projMag;
      const deltaYDeg = (thetaDeg * projY) / projMag;

      targetPos.current = clampToSquare(deltaXDeg / tiltSensitivity, deltaYDeg / tiltSensitivity, maxDeflection);
    };

    const handleStandardOrientation = (e: DeviceOrientationEvent) => {
      const { gamma: g, beta: b, alpha: a } = e;
      if (typeof g !== 'number' || typeof b !== 'number' || Number.isNaN(g) || Number.isNaN(b)) {
        return;
      }
      // Ignore stubbed/uninitialized (0, 0, 0) events before any real tilt arrives so fallbacks can engage
      if (!hasStandardOrientation.current && g === 0 && b === 0 && (a === null || a === 0)) {
        return;
      }
      receivedValidLegacySensorRef.current = true;
      hasStandardOrientation.current = true;
      hasAnyOrientation.current = true;
      const bRad = b * DEG_TO_RAD;
      const gRad = g * DEG_TO_RAD;
      const cosB = Math.cos(bRad);
      updateTargetFromUnitVector(
        'orientation',
        cosB * Math.sin(gRad),
        Math.sin(bRad),
        cosB * Math.cos(gRad),
      );
    };

    const handleAbsoluteOrientation = (e: Event) => {
      if (hasStandardOrientation.current) return;
      const oe = e as DeviceOrientationEvent;
      const { gamma: g, beta: b, alpha: a } = oe;
      if (typeof g !== 'number' || typeof b !== 'number' || Number.isNaN(g) || Number.isNaN(b)) {
        return;
      }
      if (!hasAnyOrientation.current && g === 0 && b === 0 && (a === null || a === 0)) {
        return;
      }
      receivedValidLegacySensorRef.current = true;
      hasAnyOrientation.current = true;
      const bRad = b * DEG_TO_RAD;
      const gRad = g * DEG_TO_RAD;
      const cosB = Math.cos(bRad);
      updateTargetFromUnitVector(
        'orientation',
        cosB * Math.sin(gRad),
        Math.sin(bRad),
        cosB * Math.cos(gRad),
      );
    };

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let hasMotionGravity = false;
    let rotAngleX = 0;
    let rotAngleY = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (hasAnyOrientation.current) return;

      const acc = e.accelerationIncludingGravity;
      if (
        acc &&
        typeof acc.x === 'number' &&
        typeof acc.y === 'number' &&
        typeof acc.z === 'number' &&
        !Number.isNaN(acc.x) &&
        !Number.isNaN(acc.y) &&
        !Number.isNaN(acc.z)
      ) {
        const gLen = Math.hypot(acc.x, acc.y, acc.z);
        if (gLen >= 1) {
          receivedValidLegacySensorRef.current = true;
          hasMotionGravity = true;
          const sign = isIOS ? -1 : 1;
          updateTargetFromUnitVector(
            'motion',
            (-acc.x * sign) / gLen,
            (acc.y * sign) / gLen,
            (acc.z * sign) / gLen,
          );
          return;
        }
      }

      // Secondary devicemotion fallback: integrate rotationRate (angular velocity) when gravity vector is unavailable
      if (!hasMotionGravity && e.rotationRate) {
        const { beta: rb, gamma: rg } = e.rotationRate;
        if (typeof rb === 'number' && typeof rg === 'number' && !Number.isNaN(rb) && !Number.isNaN(rg)) {
          if (rb === 0 && rg === 0 && rotAngleX === 0 && rotAngleY === 0) return;
          receivedValidLegacySensorRef.current = true;
          const rawInterval = e.interval || 16;
          const dtSec = rawInterval > 1 ? Math.min(rawInterval / 1000, 0.05) : Math.min(rawInterval, 0.05);
          rotAngleX = rotAngleX * 0.985 + rg * dtSec;
          rotAngleY = rotAngleY * 0.985 + rb * dtSec;
          const bRad = rotAngleY * DEG_TO_RAD;
          const gRad = rotAngleX * DEG_TO_RAD;
          const cosB = Math.cos(bRad);
          updateTargetFromUnitVector(
            'motion',
            cosB * Math.sin(gRad),
            Math.sin(bRad),
            cosB * Math.cos(gRad),
          );
        }
      }
    };

    // W3C Generic Sensor API fallback (only activated AFTER page load if zero legacy events arrived)
    interface GenericSensorLike {
      start: () => void;
      stop: () => void;
      addEventListener: (type: string, cb: () => void) => void;
      quaternion?: number[];
      x?: number;
      y?: number;
      z?: number;
    }
    type SensorConstructor = new (opts?: { frequency?: number; referenceFrame?: string }) => GenericSensorLike;
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
      if (receivedValidLegacySensorRef.current || activeGenericSensor) return;
      const win = window as unknown as Record<string, SensorConstructor | undefined>;

      const tryOrientationSensor = (Ctor: SensorConstructor | undefined): boolean => {
        if (!Ctor) return false;
        try {
          const sensor = new Ctor({ frequency: 60 });
          sensor.addEventListener('reading', () => {
            if (receivedValidLegacySensorRef.current) {
              stopGenericSensor();
              return;
            }
            const q = sensor.quaternion;
            if (!q || q.length < 4) return;
            const [qx, qy, qz, qw] = q;
            updateTargetFromUnitVector(
              'generic',
              2 * (qw * qy - qx * qz),
              2 * (qy * qz + qw * qx),
              1 - 2 * (qx * qx + qy * qy),
            );
          });
          sensor.addEventListener('error', () => {
            stopGenericSensor();
          });
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
            if (receivedValidLegacySensorRef.current) {
              stopGenericSensor();
              return;
            }
            const { x: gx, y: gy, z: gz } = sensor;
            if (typeof gx !== 'number' || typeof gy !== 'number' || typeof gz !== 'number') return;
            const gLen = Math.hypot(gx, gy, gz);
            if (gLen < 1) return;
            updateTargetFromUnitVector('generic', -gx / gLen, gy / gLen, gz / gLen);
          });
          sensor.addEventListener('error', () => {
            stopGenericSensor();
          });
          sensor.start();
          activeGenericSensor = sensor;
          return true;
        } catch {
          return false;
        }
      };

      if (tryOrientationSensor(win.RelativeOrientationSensor)) return;
      if (tryOrientationSensor(win.AbsoluteOrientationSensor)) return;
      if (tryGravitySensor(win.GravitySensor)) return;
      tryGravitySensor(win.Accelerometer);
    };

    const attachSensorListeners = () => {
      window.addEventListener('deviceorientation', handleStandardOrientation, true);
      window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
      window.addEventListener('devicemotion', handleDeviceMotion, true);
    };

    const detachSensorListeners = () => {
      window.removeEventListener('deviceorientation', handleStandardOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
      stopGenericSensor();
    };

    // Immediately register standard capture-phase listeners (Android, WeChat, WebViews, DevTools Sensors)
    attachSensorListeners();

    let genericFallbackTimer: number | null = null;

    // Re-ensure sensor attachment when page finishes loading or becomes visible (fixes slow-load browser drops)
    const ensureSensorsAfterLoad = () => {
      if (!receivedValidLegacySensorRef.current) {
        detachSensorListeners();
        attachSensorListeners();
        calibrateOrigin();
        if (isLoadedRef.current && genericFallbackTimer === null) {
          genericFallbackTimer = window.setTimeout(() => {
            genericFallbackTimer = null;
            if (!receivedValidLegacySensorRef.current) {
              startGenericSensorFallback();
            }
          }, 1200);
        }
      }
    };
    ensurePostLoadSensorsRef.current = ensureSensorsAfterLoad;
    if (isLoadedRef.current) {
      ensureSensorsAfterLoad();
    }

    window.addEventListener('load', ensureSensorsAfterLoad);
    window.addEventListener('pageshow', ensureSensorsAfterLoad);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        ensureSensorsAfterLoad();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // iOS Safari 13+ requires requestPermission() inside a 'click' activation gesture.
    // Force click synthesis on non-interactive SVG/div elements in iOS WebKit via cursor: pointer until resolved.
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
            detachSensorListeners();
            attachSensorListeners();
            calibrateOrigin();
            document.removeEventListener('click', requestPermissionOnClick, true);
          } else {
            permissionStatus = 'denied';
            restoreCursor();
          }
        })
        .catch(() => {
          // Gesture was not trusted or cancelled; allow next tap to retry
          permissionStatus = 'idle';
        });
    };

    const reactivateSensorsOnGesture = () => {
      if (receivedValidLegacySensorRef.current) {
        document.removeEventListener('pointerdown', reactivateSensorsOnGesture, true);
        return;
      }
      detachSensorListeners();
      attachSensorListeners();
      if (isLoadedRef.current && Date.now() - mountTime > 1200) {
        startGenericSensorFallback();
      }
    };

    if (reqFn && !iosPermissionGrantedRef.current) {
      if (document.body) {
        document.body.style.cursor = 'pointer';
      }
      document.addEventListener('click', requestPermissionOnClick, { capture: true, passive: true });
    } else if (!reqFn) {
      document.addEventListener('pointerdown', reactivateSensorsOnGesture, { capture: true, passive: true });
    }

    return () => {
      ensurePostLoadSensorsRef.current = null;
      if (genericFallbackTimer !== null) {
        window.clearTimeout(genericFallbackTimer);
      }
      window.removeEventListener('load', ensureSensorsAfterLoad);
      window.removeEventListener('pageshow', ensureSensorsAfterLoad);
      document.removeEventListener('visibilitychange', handleVisibility);
      detachSensorListeners();
      if (reqFn) {
        restoreCursor();
        document.removeEventListener('click', requestPermissionOnClick, true);
      } else {
        document.removeEventListener('pointerdown', reactivateSensorsOnGesture, true);
      }
    };
  }, [enableGyroscope, maxDeflection, tiltSensitivity, calibrateOrigin]);

  return {
    renderPos,
    targetPos,
    handleMouseMove,
    handlePointerMove,
    handleMouseLeave,
    resetTarget,
    calibrateOrigin,
  };
}
