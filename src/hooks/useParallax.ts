import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseParallaxOptions {
  damping?: number;
  enableGyroscope?: boolean;
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
}

/**
 * High-performance parallax physics hook with inertia / lerp damping loop
 * and cross-platform support (mouse tracking and mobile deviceorientation).
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxResult {
  const { damping = 0.11, enableGyroscope = false } = options;
  const [renderPos, setRenderPos] = useState<ParallaxCoords>({ x: 0, y: 0 });
  const targetPos = useRef<ParallaxCoords>({ x: 0, y: 0 });
  const currentPos = useRef<ParallaxCoords>({ x: 0, y: 0 });

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

      // Higher sensitivity: 20 deg tilt reaches full deflection
      const gamma = Math.min(Math.max(e.gamma, -40), 40);
      const beta = Math.min(Math.max(e.beta - 45, -40), 40);

      targetPos.current = {
        x: gamma / 20,
        y: beta / 20,
      };
    };

    const requestDeviceOrientation = () => {
      // 1. Immediately register orientation listeners so Android, webviews, and previously-granted iOS work instantly without clicking
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);

      // 2. If browser requires explicit requestPermission (e.g. iOS Safari 13+), attempt auto-request + bind to first interaction
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === 'function'
      ) {
        const reqPerm = (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> });

        // Try calling immediately on mount (works in some webviews, standalone PWAs, and relaxed contexts)
        try {
          reqPerm.requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation, true);
                window.addEventListener('deviceorientationabsolute', handleOrientation, true);
              }
            })
            .catch(() => {});
        } catch {
          // Expected in standard Safari without user gesture
        }

        // Also bind to first interaction on both window and document with capture to trigger permission prompt seamlessly
        const onFirstInteraction = () => {
          try {
            reqPerm.requestPermission()
              .then((permissionState: string) => {
                if (permissionState === 'granted') {
                  window.addEventListener('deviceorientation', handleOrientation, true);
                  window.addEventListener('deviceorientationabsolute', handleOrientation, true);
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
  }, [enableGyroscope]);

  return {
    renderPos,
    targetPos,
    handleMouseMove,
    handleMouseLeave,
    resetTarget,
  };
}
