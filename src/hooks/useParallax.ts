import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseParallaxOptions {
  damping?: number;
  enableGyroscope?: boolean;
  maxDeflection?: number;
  tiltSensitivity?: number;
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
 * and cross-platform support.
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxResult {
  const {
    damping = 0.11,
    enableGyroscope = false,
    maxDeflection = 0.8,
    tiltSensitivity = 24,
  } = options;

  const [renderPos, setRenderPos] = useState<ParallaxCoords>({ x: 0, y: 0 });
  const targetPos = useRef<ParallaxCoords>({ x: 0, y: 0 });
  const currentPos = useRef<ParallaxCoords>({ x: 0, y: 0 });

  // Calibrated origin orientation captured right upon page load
  const originPos = useRef<{ gamma: number; beta: number } | null>(null);

  const calibrateOrigin = useCallback(() => {
    originPos.current = null;
  }, []);

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

    let hasGyroscope = false;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      hasGyroscope = true;

      // 1. Calibrate origin: initial reading right after page load becomes (0, 0)
      if (originPos.current === null) {
        originPos.current = {
          gamma: e.gamma,
          beta: e.beta,
        };
      }

      // 2. Calculate relative tilt offset from the calibrated posture
      let dGamma = e.gamma - originPos.current.gamma;
      let dBeta = e.beta - originPos.current.beta;

      // Wrap around handling for [-180, 180]
      dGamma = ((((dGamma + 180) % 360) + 360) % 360) - 180;
      dBeta = ((((dBeta + 180) % 360) + 360) % 360) - 180;

      // 3. Sensitivity scale
      const rawX = dGamma / tiltSensitivity;
      const rawY = dBeta / tiltSensitivity;

      // 4. Strict clamping (upper limit) to avoid excessive parallax movement
      targetPos.current = {
        x: Math.min(Math.max(rawX, -maxDeflection), maxDeflection),
        y: Math.min(Math.max(rawY, -maxDeflection), maxDeflection),
      };
    };

    const requestDeviceOrientation = () => {
      // 1. Immediately register orientation listeners
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);

      // Listen for window load event to re-calibrate if not yet complete
      if (document.readyState !== 'complete') {
        const onLoad = () => {
          calibrateOrigin();
        };
        window.addEventListener('load', onLoad, { once: true });
      }

      // 2. Permission handling for iOS Safari 13+
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === 'function'
      ) {
        const reqPerm = DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> };

        try {
          reqPerm.requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
                window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                calibrateOrigin();
              }
            })
            .catch(() => {});
        } catch {
          // Expected in standard Safari without gesture
        }

        const onFirstInteraction = () => {
          try {
            reqPerm.requestPermission()
              .then((permissionState: string) => {
                if (permissionState === 'granted') {
                  window.addEventListener('deviceorientation', handleOrientation, true);
                  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
                  calibrateOrigin();
                }
              })
              .catch(() => {});
          } catch {}
        };

        window.addEventListener('touchend', onFirstInteraction, { once: true, passive: true, capture: true });
        window.addEventListener('click', onFirstInteraction, { once: true, passive: true, capture: true });
        document.addEventListener('touchend', onFirstInteraction, { once: true, passive: true, capture: true });
        document.addEventListener('click', onFirstInteraction, { once: true, passive: true, capture: true });
      }
    };

    requestDeviceOrientation();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
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
