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

  // Gyroscope / Device orientation (Mobile) - clamped within circular radial area
  useEffect(() => {
    if (!enableGyroscope || typeof window === 'undefined') return;

    hasStandardOrientation.current = false;

    const processOrientation = (g: number | null, b: number | null, isAbsoluteFallback: boolean) => {
      if (isAbsoluteFallback && hasStandardOrientation.current) return;
      if (typeof g !== 'number' || typeof b !== 'number' || Number.isNaN(g) || Number.isNaN(b)) {
        return;
      }

      if (!isAbsoluteFallback) {
        hasStandardOrientation.current = true;
      }
      lastGyroEventTime.current = Date.now();

      // If calibration is flagged, record the exact current posture as the center (0, 0)
      if (needsCalibration.current || originGamma.current === null || originBeta.current === null) {
        originGamma.current = g;
        originBeta.current = b;
        needsCalibration.current = false;
      }

      // Delta angles from calibrated baseline
      const deltaX = g - originGamma.current;
      const deltaY = b - originBeta.current;

      // Map to normalized range with sensitivity and strictly clamp within circle radius
      const rawX = deltaX / tiltSensitivity;
      const rawY = deltaY / tiltSensitivity;

      targetPos.current = clampToCircle(rawX, rawY, maxDeflection);
    };

    const handleStandardOrientation = (e: DeviceOrientationEvent) => {
      processOrientation(e.gamma, e.beta, false);
    };

    const handleAbsoluteOrientation = (e: Event) => {
      const oe = e as DeviceOrientationEvent;
      processOrientation(oe.gamma, oe.beta, true);
    };

    const attachOrientationListeners = () => {
      window.addEventListener('deviceorientation', handleStandardOrientation, true);
      window.addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    };

    const detachOrientationListeners = () => {
      window.removeEventListener('deviceorientation', handleStandardOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
    };

    // Immediately register listeners (Android, WeChat, Webviews, DevTools Sensors)
    attachOrientationListeners();

    // iOS Safari 13+ requires requestPermission() inside a completed activation gesture (touchend / click, NOT touchstart)
    let permissionStatus: 'idle' | 'pending' | 'granted' | 'denied' = 'idle';
    const requestPermissionOnGesture = () => {
      if (permissionStatus === 'pending' || permissionStatus === 'granted') return;
      const doe = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DeviceOrientationEvent === 'undefined' || typeof doe.requestPermission !== 'function') {
        return;
      }

      permissionStatus = 'pending';
      doe
        .requestPermission()
        .then((state) => {
          if (state === 'granted') {
            permissionStatus = 'granted';
            detachOrientationListeners();
            attachOrientationListeners();
            calibrateOrigin();
            window.removeEventListener('touchend', requestPermissionOnGesture, true);
            window.removeEventListener('click', requestPermissionOnGesture, true);
          } else {
            permissionStatus = 'denied';
          }
        })
        .catch(() => {
          // Gesture was not trusted (e.g., cancelled or blocked); allow next tap to retry
          permissionStatus = 'idle';
        });
    };

    window.addEventListener('touchend', requestPermissionOnGesture, { capture: true, passive: true });
    window.addEventListener('click', requestPermissionOnGesture, { capture: true, passive: true });

    return () => {
      detachOrientationListeners();
      window.removeEventListener('touchend', requestPermissionOnGesture, true);
      window.removeEventListener('click', requestPermissionOnGesture, true);
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
