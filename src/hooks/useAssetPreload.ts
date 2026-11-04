import { useState, useEffect } from 'react';
import { CORE_PRELOAD_ASSETS } from '../constants/assets';

interface UseAssetPreloadOptions {
  timeoutMs?: number;
  assets?: readonly string[];
}

interface UseAssetPreloadResult {
  isLoading: boolean;
  progress: number;
  loadedCount: number;
  totalCount: number;
}

/**
 * Preload critical image assets with fallback safety timeout and progress tracking.
 */
export function useAssetPreload(options: UseAssetPreloadOptions = {}): UseAssetPreloadResult {
  const { timeoutMs = 1800, assets = CORE_PRELOAD_ASSETS } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let count = 0;

    const promises = assets.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (isMounted) {
            count += 1;
            setLoadedCount(count);
          }
          resolve();
        };
        img.onerror = () => {
          if (isMounted) {
            count += 1;
            setLoadedCount(count);
          }
          resolve();
        };
      });
    });

    // Ensure assets are preloaded or fallback after max timeout
    const timeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, timeoutMs);

    Promise.all(promises).then(() => {
      if (isMounted) {
        setTimeout(() => {
          setIsLoading(false);
        }, 150);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [assets, timeoutMs]);

  const progress = assets.length > 0 ? Math.round((loadedCount / assets.length) * 100) : 100;

  return {
    isLoading,
    progress,
    loadedCount,
    totalCount: assets.length,
  };
}
