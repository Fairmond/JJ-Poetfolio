import { useState, useEffect } from 'react';

/**
 * Aspect Ratio Switch:
 * - Portrait (width < height, AspectRatio < 1) -> Mobile Mode
 * - Landscape (width >= height, AspectRatio >= 1) -> Desktop 1:1 Vector Stage
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < window.innerHeight;
    }
    return false;
  });

  useEffect(() => {
    const updateOrientation = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < h);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.visualViewport?.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.visualViewport?.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return isMobile;
}
