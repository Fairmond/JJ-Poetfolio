import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseParallaxOptions {
  damping?: number;
  enableGyroscope?: boolean;
  maxDeflection?: number;
  tiltSensitivity?: number;
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
 * dynamic post-load gyroscope origin calibration, strict movement clamping,
 * and robust cross-platform device orientation support.
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxResult {
  const {
    damping = 0.11,
    enableGyroscope = false,
    maxDeflection = 0.85,
    tiltSensitivity = 20,
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

  // Mouse move handler (PC)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetPos.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    targetPos.current = { x: 0, y: 0 };
  }, []);

  const resetTarget = useCallback(() => {
    targetPos.current = { x: 0, y: 0 };
  }, []);

  // Gyroscope / Device orientation (Mobile)
  useEffect(() => {
    if (!enableGyroscope || typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const g = e.gamma;
      const b = e.beta;
      if (typeof g !== 'number' || typeof b !== 'number' || isNaN(g) || isNaN(b)) {
        return;
      }

      // If calibration is flagged, record the exact current posture as the center (0, 0)
      if (needsCalibration.current || originGamma.current === null || originBeta.current === null) {
        originGamma.current = g;
        originBeta.current = b;
        needsCalibration.current = false;
      }

      // Delta angles from calibrated baseline
      const deltaX = g - originGamma.current;
      const deltaY = b - originBeta.current;

      // Map to normalized range with sensitivity and strictly enforce upper limit clamp
      const rawX = deltaX / tiltSensitivity;
      const rawY = deltaY / tiltSensitivity;

      targetPos.current = {
        x: Math.min(Math.max(rawX, -maxDeflection), maxDeflection),
        y: Math.min(Math.max(rawY, -maxDeflection), maxDeflection),
      };
    };

    // Immediately register standard deviceorientation listener (Android, WeChat, Webviews)
    window.addEventListener('deviceorientation', handleOrientation, true);

    // iOS Safari 13+ permission handling on first user interaction gesture
    let permissionRequested = false;
    const requestPermissionOnGesture = () => {
      if (permissionRequested) return;
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === 'function'
      ) {
        permissionRequested = true;
        (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
          .requestPermission()
          .then((state) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, true);
              calibrateOrigin();
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('touchstart', requestPermissionOnGesture, { passive: true, once: true });
    window.addEventListener('touchend', requestPermissionOnGesture, { passive: true, once: true });
    window.addEventListener('click', requestPermissionOnGesture, { passive: true, once: true });

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('touchstart', requestPermissionOnGesture);
      window.removeEventListener('touchend', requestPermissionOnGesture);
      window.removeEventListener('click', requestPermissionOnGesture);
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
