import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PreloaderProps {
  isLoading: boolean;
  progress: number;
}

export const Preloader: React.FC<PreloaderProps> = ({ isLoading, progress }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 bg-[#eae8e4] flex flex-col items-center justify-center pointer-events-auto select-none"
        >
          {/* Center Geometric Skeleton Mockup */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Polaroid Frame Placeholder */}
            <div className="w-[180px] h-[220px] sm:w-[220px] sm:h-[270px] bg-[#f7f5f0] rounded-xl shadow-lg border border-[#dfdad0] p-4 flex flex-col items-center justify-between relative overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

              {/* Inner Photo Area */}
              <div className="w-full h-[78%] bg-[#e3ded4] rounded-lg relative overflow-hidden flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#d5cfc2] animate-pulse" />
              </div>
              {/* Bottom Text Area */}
              <div className="w-3/4 h-2.5 bg-[#dfdad0] rounded-full self-start" />
            </div>

            {/* Minimal Loading Bar & Percentage */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-36 h-1 bg-[#d8d2c4] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#292727] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>
              <span className="text-[12px] font-sans tracking-widest text-[#7a7474]">
                LOADING {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
