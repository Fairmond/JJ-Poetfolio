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

  // Track sensor activity so mouse fallback never overrides active gyroscope or touch taps
  const lastGyroEventTime = useRef<number>(0);
  const hasStandardOrientation = useRef<boolean>(false);
  const hasAnyOrientation = useRef<boolean>(false);

  // Mouse move handler (PC / Desktop preview) - reaches full radius within center 60% area, angle-only beyond
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // Ignore synthetic mousemove synthesized from touch taps on mobile browsers
      const nativeEvt = e.nativeEvent as MouseEvent & {
        sourceCapabilities?: { firesTouchEvents?: boolean };
      };
      if (nativeEvt.sourceCapabilities?.firesTouchEvents) return;

      // Do not let mouse hover overwrite active gyroscope readings
      if (enableGyroscope && Date.now() - lastGyroEventTime.current < 3000) return;

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

    const updateTargetFromAngles = (angleX: number, angleY: number) => {
      lastGyroEventTime.current = Date.now();

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
      const { gamma: g, beta: b } = e;
      if (typeof g !== 'number' || typeof b !== 'number' || Number.isNaN(g) || Number.isNaN(b)) {
        return;
      }
      hasStandardOrientation.current = true;
      hasAnyOrientation.current = true;
      updateTargetFromAngles(g, b);
    };

    const handleAbsoluteOrientation = (e: Event) => {
      if (hasStandardOrientation.current) return;
      const oe = e as DeviceOrientationEvent;
      const { gamma: g, beta: b } = oe;
      if (typeof g !== 'number' || typeof b !== 'number' || Number.isNaN(g) || Number.isNaN(b)) {
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
    // Note: Do NOT listen on 'touchend' here, as touchend fires just before click, marks status 'pending',
    // causes click to be skipped, and WebKit rejects requestPermission from non-click touch events.
    let permissionStatus: 'idle' | 'pending' | 'granted' | 'denied' = 'idle';
    const requestPermissionOnClick = () => {
      if (permissionStatus === 'pending' || permissionStatus === 'granted') return;
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

      if (!reqFn) return;

      permissionStatus = 'pending';
      reqFn()
        .then((state) => {
          if (state === 'granted') {
            permissionStatus = 'granted';
            detachSensorListeners();
            attachSensorListeners();
            calibrateOrigin();
            window.removeEventListener('click', requestPermissionOnClick, true);
          } else {
            permissionStatus = 'denied';
          }
        })
        .catch(() => {
          // Gesture was not trusted or cancelled; allow next tap to retry
          permissionStatus = 'idle';
        });
    };

    window.addEventListener('click', requestPermissionOnClick, { capture: true, passive: true });

    return () => {
      detachSensorListeners();
      window.removeEventListener('click', requestPermissionOnClick, true);
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
