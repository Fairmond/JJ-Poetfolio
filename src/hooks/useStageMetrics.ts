import { useState, useEffect, RefObject } from 'react';
import { StageMetrics } from '../types';
import { PC_CANVAS_WIDTH, PC_CANVAS_HEIGHT, PC_ASPECT_RATIO } from '../constants/layout';

const TITLE_BASE_X = 246; // Shifted right by 50px per user request

const DEFAULT_METRICS: StageMetrics = {
  scale: 1,
  panX: 0,
  panY: 0,
  windowLeftInCanvas: 0,
  windowRightInCanvas: PC_CANVAS_WIDTH,
  titleScale: 1.0,
  titleX: TITLE_BASE_X,
  tornCenterX: 634,
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : PC_CANVAS_WIDTH,
};

/**
 * Intelligent Viewport Scaler & Adaptive Contain Math Hook for PC Stage.
 * Computes exact boundaries and widescreen compensations.
 */
export function useStageMetrics(containerRef: RefObject<HTMLDivElement | null>): StageMetrics {
  const [metrics, setMetrics] = useState<StageMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;

      const cw = container.clientWidth || window.innerWidth;
      const ch = container.clientHeight || window.innerHeight;

      // 1. Calculate pure contain scale to guarantee 100% full visibility without clipping or distortion
      const scaleX = cw / PC_CANVAS_WIDTH;
      const scaleY = ch / PC_CANVAS_HEIGHT;
      const fitScale = Math.min(scaleX, scaleY);
      const finalScale = Math.max(fitScale, 0.35);

      // 2. Calculate window's left and right boundaries in canvas coordinates
      const halfVisibleWidth = cw / (2 * finalScale);
      const windowLeftInCanvas = (PC_CANVAS_WIDTH / 2) - halfVisibleWidth;
      const windowRightInCanvas = (PC_CANVAS_WIDTH / 2) + halfVisibleWidth;

      // Dynamic torn paper center: offset by 17% of visible viewport width to the left of page center
      const visibleWidth = halfVisibleWidth * 2;
      const tornCenterX = (PC_CANVAS_WIDTH / 2) - visibleWidth * 0.17;

      // 3. Targeted Title Scale & Placement Tuning for Flatter / Widescreen Screens
      const aspect = cw / Math.max(ch, 1);
      let titleScale = 1.0;
      let titleX = TITLE_BASE_X;

      if (aspect > PC_ASPECT_RATIO) {
        const excess = aspect - PC_ASPECT_RATIO;
        titleScale = 1.0 + Math.min(excess * 0.36, 0.36); // up to +36% larger

        // Slightly adapt left position to make use of expanded left width
        const leftSpaceAvailable = (PC_CANVAS_WIDTH / 2) - windowLeftInCanvas;
        const dynamicLeft = windowLeftInCanvas + leftSpaceAvailable * 0.22;
        titleX = Math.min(dynamicLeft + 50, TITLE_BASE_X);
      }

      setMetrics({
        scale: finalScale,
        panX: 0,
        panY: 0,
        windowLeftInCanvas,
        windowRightInCanvas,
        titleScale,
        titleX,
        tornCenterX,
        viewportWidth: cw,
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return metrics;
}
