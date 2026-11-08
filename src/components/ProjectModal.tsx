import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-3xl bg-[#faf8f5] rounded-3xl shadow-2xl border border-neutral-300/60 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className={`relative h-44 sm:h-56 bg-gradient-to-r ${project.bannerBg || 'from-neutral-900 to-neutral-800'} p-6 sm:p-8 flex flex-col justify-end text-white overflow-hidden`}>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Category */}
            <div className="relative z-10 space-y-1">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white/90 uppercase tracking-widest mb-2">
                {project.category}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {project.title}
              </h2>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {project.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-neutral-200/80 text-neutral-800 rounded-full text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                项目概述
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-sans">
                {project.description}
              </p>
            </div>

            {/* Deliverables / Highlights */}
            {project.deliverables && project.deliverables.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-700" />
                  核心交付与工作流
                </h3>
                <ul className="space-y-2">
                  {project.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between">
            {project.websiteUrl ? (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-full transition-all shadow-sm cursor-pointer no-underline active:scale-95"
              >
                <span>官网入口</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              关闭视图
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
