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

function clampToSquare(x: number, y: number, limit: number): ParallaxCoords {
  return {
    x: Math.max(-limit, Math.min(limit, x)),
    y: Math.max(-limit, Math.min(limit, y)),
  };
}

/**
 * Build 3x3 W3C DeviceOrientation rotation matrix R = Rz(alpha) * Rx(beta) * Ry(gamma)
 * stored row-major as a 9-element tuple. Free of Euler gimbal-lock jumps around beta = ±90°.
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

/**
 * High-performance parallax physics hook with inertia / lerp damping loop,
 * gimbal-lock-free 3D screen-normal gyroscope tracking, square clamping,
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

  // Desktop mouse parallax (reaches full range within center mouseActiveRatio rectangle)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (enableGyroscope) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const safeRatio = mouseActiveRatio > 0 ? mouseActiveRatio : 1;
      const rawX = (((e.clientX - rect.left) / rect.width - 0.5) * 2) / safeRatio;
      const rawY = (((e.clientY - rect.top) / rect.height - 0.5) * 2) / safeRatio;
      targetPos.current = clampToSquare(rawX, rawY, maxDeflection);
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

  // Mobile gyroscope listener (single clean orientation stream, zero noisy fallbacks)
  useEffect(() => {
    if (!enableGyroscope || typeof window === 'undefined') return;

    originMatrixRef.current = null;
    smoothedTiltRef.current = null;
    needsCalibrationRef.current = true;
    let hasStandardOrientation = false;

    const processOrientation = (e: DeviceOrientationEvent, isAbsoluteFallback: boolean) => {
      if (isAbsoluteFallback && hasStandardOrientation) return;

      const { alpha: rawA, beta: b, gamma: g } = e;
      if (typeof b !== 'number' || typeof g !== 'number' || Number.isNaN(b) || Number.isNaN(g)) {
        return;
      }

      const a = typeof rawA === 'number' && !Number.isNaN(rawA) ? rawA : 0;

      // Ignore uninitialized (0, 0, 0) stub readings before real sensor values arrive
      if (!hasStandardOrientation && b === 0 && g === 0 && a === 0) {
        return;
      }

      if (!isAbsoluteFallback) {
        hasStandardOrientation = true;
      }

      if (needsCalibrationRef.current || originMatrixRef.current === null) {
        originMatrixRef.current = buildW3CMatrix(a, b, g);
        smoothedTiltRef.current = { x: 0, y: 0 };
        needsCalibrationRef.current = false;
        targetPos.current = { x: 0, y: 0 };
        return;
      }

      // Express current screen normal (3rd column of R) in the calibrated baseline frame M0:
      // relZ = M0^T * z_current
      const m0 = originMatrixRef.current;
      const aRad = a * DEG_TO_RAD;
      const bRad = b * DEG_TO_RAD;
      const gRad = g * DEG_TO_RAD;
      const ca = Math.cos(aRad);
      const sa = Math.sin(aRad);
      const cb = Math.cos(bRad);
      const sb = Math.sin(bRad);
      const cg = Math.cos(gRad);
      const sg = Math.sin(gRad);

      const zx = ca * sg + cg * sa * sb;
      const zy = sa * sg - ca * cg * sb;
      const zz = cb * cg;

      const rx = m0[0] * zx + m0[3] * zy + m0[6] * zz;
      const ry = m0[1] * zx + m0[4] * zy + m0[7] * zz;
      const rz = m0[2] * zx + m0[5] * zy + m0[8] * zz;

      let rawDxDeg: number;
      let rawDyDeg: number;
      if (rz < 0 && Math.abs(ry) > Math.abs(rx)) {
        rawDxDeg = Math.atan2(rx, -rz) * RAD_TO_DEG;
        rawDyDeg = Math.atan2(-ry, rz) * RAD_TO_DEG;
      } else {
        rawDxDeg = Math.atan2(rx, rz) * RAD_TO_DEG;
        rawDyDeg = -Math.asin(Math.max(-1, Math.min(1, ry))) * RAD_TO_DEG;
      }

      // Light EMA smoothing on continuous angle degrees to suppress high-frequency sensor jitter
      const prev = smoothedTiltRef.current ?? { x: rawDxDeg, y: rawDyDeg };
      const emaAlpha = 0.45;
      const smoothX = prev.x + (rawDxDeg - prev.x) * emaAlpha;
      const smoothY = prev.y + (rawDyDeg - prev.y) * emaAlpha;
      smoothedTiltRef.current = { x: smoothX, y: smoothY };

      targetPos.current = clampToSquare(
        smoothX / tiltSensitivity,
        smoothY / tiltSensitivity,
        maxDeflection,
      );
    };

    const handleStandard = (e: DeviceOrientationEvent) => processOrientation(e, false);
    const handleAbsolute = (e: Event) => processOrientation(e as DeviceOrientationEvent, true);

    const attach = () => {
      window.addEventListener('deviceorientation', handleStandard, true);
      window.addEventListener('deviceorientationabsolute', handleAbsolute, true);
    };

    const detach = () => {
      window.removeEventListener('deviceorientation', handleStandard, true);
      window.removeEventListener('deviceorientationabsolute', handleAbsolute, true);
    };

    attach();

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
    const reqFn =
      doe && typeof doe.requestPermission === 'function'
        ? doe.requestPermission.bind(DeviceOrientationEvent)
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
