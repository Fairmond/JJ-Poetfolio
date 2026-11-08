import { useState, useEffect, useRef } from 'react';
import { CORE_PRELOAD_ASSETS } from '../constants/assets';

interface UseAssetPreloadOptions {
  timeoutMs?: number;
  assets?: readonly string[];
  minDisplayTimeMs?: number;
}

interface UseAssetPreloadResult {
  isLoading: boolean;
  progress: number;
  loadedCount: number;
  totalCount: number;
}

/**
 * Preload critical image assets and fonts with GPU bitmap decoding
 * to guarantee zero pop-in before the preloader exits.
 */
export function useAssetPreload(options: UseAssetPreloadOptions = {}): UseAssetPreloadResult {
  const {
    timeoutMs = 12000,
    assets = CORE_PRELOAD_ASSETS,
    minDisplayTimeMs = 500,
  } = options;

  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let isMounted = true;
    let completed = 0;
    startTimeRef.current = Date.now();

    // Deduplicate asset URLs
    const uniqueAssets = Array.from(new Set(assets));
    const totalItems = uniqueAssets.length;

    if (totalItems === 0) {
      setIsLoading(false);
      setDisplayProgress(100);
      return;
    }

    const preloadSingleImage = (src: string): Promise<void> => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;

        const onDone = async () => {
          // Decode image into GPU memory to eliminate blank paint frame
          if ('decode' in img) {
            try {
              await img.decode();
            } catch {
              // Ignore decode rejection if browser doesn't support or already decoded
            }
          }
          if (isMounted) {
            completed += 1;
            setLoadedCount(completed);
            setDisplayProgress(Math.round((completed / totalItems) * 100));
          }
          resolve();
        };

        if (img.complete && img.naturalWidth > 0) {
          onDone();
        } else {
          img.onload = onDone;
          img.onerror = () => {
            // Treat broken image gracefully so app never freezes
            if (isMounted) {
              completed += 1;
              setLoadedCount(completed);
              setDisplayProgress(Math.round((completed / totalItems) * 100));
            }
            resolve();
          };
        }
      });
    };

    // Preload all critical images
    const imagePromises = uniqueAssets.map(preloadSingleImage);

    // Also wait for document web fonts to be fully loaded
    const fontsPromise = (typeof document !== 'undefined' && document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(() => {})
      : Promise.resolve();

    const finishLoading = () => {
      if (!isMounted) return;
      const elapsed = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, minDisplayTimeMs - elapsed);

      setTimeout(() => {
        if (isMounted) {
          setDisplayProgress(100);
          // Brief 200ms pause at 100% so user perceives completion before fade-out
          setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          }, 200);
        }
      }, remainingTime);
    };

    // Safety timeout: only fallback if network genuinely hangs
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        finishLoading();
      }
    }, timeoutMs);

    Promise.all([...imagePromises, fontsPromise]).then(() => {
      clearTimeout(safetyTimeout);
      finishLoading();
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [assets, timeoutMs, minDisplayTimeMs]);

  return {
    isLoading,
    progress: displayProgress,
    loadedCount,
    totalCount: assets.length,
  };
}
