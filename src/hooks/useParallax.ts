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
 * dynamic post-load gyroscope origin calibration, circular radial movement clamping,
 * and robust cross-platform device orientation support.
 */
function clampToCircle(x: number, y: number, radius: number): ParallaxCoords {
  const dist = Math.hypot(x, y);
  if (dist > radius && dist > 0) {
    const scale = radius / dist;
    return {
      x: x * scale,
      y: y * scale,
    };
  }
  return { x, y };
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

  // Calibrated origin: baseline angles captured upon page load completion
  const originGamma = useRef<number | null>(null);
  const originBeta = useRef<number | null>(null);
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

  // Inertia / Damping lerp loop
  useEffect(() => {
    let animId: number;
    const update = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * damping;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * damping;

      setRenderPos({
        x: currentPos.current.x,
        y: currentPos.current.y,
      });

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [damping]);

  // Track real moving sensor activity so mouse fallback never overrides active gyroscope,
  // while stationary / dummy (0, 0) sensor streams never lock out mouse preview.
  const lastGyroEventTime = useRef<number>(0);
  const lastSensorAngles = useRef<{ x: number; y: number } | null>(null);
  const hasStandardOrientation = useRef<boolean>(false);
  const hasAnyOrientation = useRef<boolean>(false);

  const updateTargetFromClientXY = useCallback(
    (clientX: number, clientY: number, currentTarget: HTMLElement) => {
      const rect = currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const safeRatio = mouseActiveRatio > 0 ? mouseActiveRatio : 1;
      const rawX = (((clientX - rect.left) / rect.width - 0.5) * 2) / safeRatio;
      const rawY = (((clientY - rect.top) / rect.height - 0.5) * 2) / safeRatio;
      targetPos.current = clampToCircle(rawX, rawY, maxDeflection);
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
    lastSensorAngles.current = null;

    const updateTargetFromAngles = (angleX: number, angleY: number) => {
      if (
        lastSensorAngles.current &&
        Math.hypot(angleX - lastSensorAngles.current.x, angleY - lastSensorAngles.current.y) > 0.15
      ) {
        lastGyroEventTime.current = Date.now();
      }
      lastSensorAngles.current = { x: angleX, y: angleY };

      // If calibration is flagged, record the exact current posture as the center (0, 0)
      if (needsCalibration.current || originGamma.current === null || originBeta.current === null) {
        originGamma.current = angleX;
        originBeta.current = angleY;
        needsCalibration.current = false;
      }

      // Delta angles from calibrated baseline
      const deltaX = angleX - originGamma.current;
      const deltaY = angleY - originBeta.current;

      // Map to normalized range with sensitivity and strictly clamp within circle radius
      const rawX = deltaX / tiltSensitivity;
      const rawY = deltaY / tiltSensitivity;

      targetPos.current = clampToCircle(rawX, rawY, maxDeflection);
    };

    const handleStandardOrientation = (e: DeviceOrientationEvent) => {
      const { gamma: g, beta: b, alpha: a } = e;
      if (typeof g !== 'number' || typeof b !== 'number' || Number.isNaN(g) || Number.isNaN(b)) {
        return;
      }
      // Ignore uninitialized dummy (0, 0, 0) stream before any real reading arrives so fallbacks can engage
      if (!hasStandardOrientation.current && g === 0 && b === 0 && (a === null || a === 0)) {
        return;
      }
      hasStandardOrientation.current = true;
      hasAnyOrientation.current = true;
      updateTargetFromAngles(g, b);
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
      hasAnyOrientation.current = true;
      updateTargetFromAngles(g, b);
    };

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (hasAnyOrientation.current) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const ax = acc.x;
      const ay = acc.y;
      const az = acc.z;
      if (
        typeof ax !== 'number' ||
        typeof ay !== 'number' ||
        typeof az !== 'number' ||
        Number.isNaN(ax) ||
        Number.isNaN(ay) ||
        Number.isNaN(az)
      ) {
        return;
      }
      const gLen = Math.hypot(ax, ay, az);
      if (gLen < 1) return;

      const sign = isIOS ? -1 : 1;
      const rollDeg = Math.atan2(ax * sign, Math.hypot(ay, az)) * (180 / Math.PI);
      const pitchDeg = Math.atan2(-ay * sign, -az * sign) * (180 / Math.PI);
      updateTargetFromAngles(rollDeg, pitchDeg);
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
    };

    // Immediately register listeners (Android, WeChat, Webviews, DevTools Sensors)
    attachSensorListeners();

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

    let permissionStatus: 'idle' | 'pending' | 'granted' | 'denied' = 'idle';
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

    if (reqFn) {
      if (document.body) {
        document.body.style.cursor = 'pointer';
      }
      document.addEventListener('click', requestPermissionOnClick, { capture: true, passive: true });
    }

    return () => {
      detachSensorListeners();
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
    handlePointerMove,
    handleMouseLeave,
    resetTarget,
    calibrateOrigin,
  };
}
