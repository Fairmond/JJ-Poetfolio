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
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === 'function'
      ) {
        const onFirstInteraction = () => {
          (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
            .requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
              }
            })
            .catch(() => {});
        };
        window.addEventListener('click', onFirstInteraction, { once: true, passive: true });
        window.addEventListener('touchend', onFirstInteraction, { once: true, passive: true });
      } else if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestDeviceOrientation();

    // Touch interaction fallback (swipe / tilt on touch move provides direct tactile parallax)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const width = window.innerWidth;
      const height = window.innerHeight;
      targetPos.current = {
        x: ((touch.clientX / width - 0.5) * 2.2),
        y: ((touch.clientY / height - 0.5) * 2.2),
      };
    };

    const handleTouchEnd = () => {
      if (!hasGyroscope) {
        targetPos.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
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
