import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ARSENAL_ITEMS, ArsenalItem } from '../data/arsenalData';

// Authentic Brand Icons for each software
const SoftwareIcon: React.FC<{ type: ArsenalItem['iconType']; className?: string }> = ({
  type,
  className = 'w-11 h-11',
}) => {
  switch (type) {
    case 'figma':
      return (
        <svg viewBox="0 0 38 57" className={className} fill="none">
          <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5Z" fill="#1ABCFE" />
          <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5A9.5 9.5 0 0 1 0 47.5Z" fill="#0ACF83" />
          <path d="M19 0v19h9.5A9.5 9.5 0 0 0 19 0Z" fill="#FF7262" />
          <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5Z" fill="#F24E1E" />
          <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5Z" fill="#A259FF" />
        </svg>
      );
    case 'photoshop':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#001e36" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#31a8ff" strokeOpacity="0.4" strokeWidth="1.5" />
          <text
            x="10.5"
            y="32.5"
            fill="#31a8ff"
            fontFamily="'SF Pro Display', -apple-system, sans-serif"
            fontSize="22"
            fontWeight="700"
          >
            P
          </text>
          <text
            x="25.5"
            y="32.5"
            fill="#31a8ff"
            fontFamily="'SF Pro Display', -apple-system, sans-serif"
            fontSize="18"
            fontWeight="600"
          >
            s
          </text>
        </svg>
      );
    case 'illustrator':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#330000" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#ff9a00" strokeOpacity="0.4" strokeWidth="1.5" />
          <text
            x="10"
            y="32.5"
            fill="#ff9a00"
            fontFamily="'SF Pro Display', -apple-system, sans-serif"
            fontSize="22"
            fontWeight="700"
          >
            A
          </text>
          <text
            x="27"
            y="32.5"
            fill="#ff9a00"
            fontFamily="'SF Pro Display', -apple-system, sans-serif"
            fontSize="20"
            fontWeight="600"
          >
            i
          </text>
        </svg>
      );
    case 'framer':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#050505" />
          <path d="M14 12h20l-10 12h10l-15 15v-12h-5l10-15Z" fill="#ffffff" />
        </svg>
      );
    case 'aistudio':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <defs>
            <linearGradient id="aiStudioSparkGrad" x1="130" y1="20" x2="260" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="35%" stopColor="#9B72CF" />
              <stop offset="70%" stopColor="#D96570" />
              <stop offset="100%" stopColor="#1BA0F2" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="10" fill="#131314" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#4285f4" strokeOpacity="0.35" strokeWidth="1.2" />
          {/* Official Google AI Studio brand vector (256x266 normalized into 30x31 centered at x=8.5, y=8) */}
          <g transform="translate(8.5, 8) scale(0.116)">
            {/* Studio bracket frame */}
            <path
              fill="#1A73E8"
              d="M107.336 27.398a86.6 86.6 0 0 0-9.931 18.266H54.796c-20.175 0-36.53 16.355-36.53 36.53v127.858c0 20.175 16.355 36.53 36.53 36.53h127.858c20.175 0 36.53-16.355 36.53-36.53v-55.998a87 87 0 0 0 18.266-13.157v69.155c0 30.263-24.533 54.796-54.796 54.796H54.796C24.533 264.848 0 240.315 0 210.052V82.194c0-30.263 24.533-54.796 54.796-54.796z"
            />
            {/* Gemini 4-pointed Starburst */}
            <path
              fill="url(#aiStudioSparkGrad)"
              d="M240.874 61.238c-10.554-4.543-19.788-10.776-27.707-18.69c-7.915-7.915-14.148-17.153-18.69-27.708a82 82 0 0 1-4.221-12.465A3.135 3.135 0 0 0 187.219 0a3.134 3.134 0 0 0-3.036 2.375a82 82 0 0 1-4.22 12.465q-6.817 15.834-18.692 27.708c-7.914 7.914-17.152 14.147-27.707 18.69a82 82 0 0 1-12.465 4.22a3.135 3.135 0 0 0-2.375 3.037c0 1.436.981 2.686 2.375 3.037a82 82 0 0 1 12.465 4.22c10.555 4.543 19.79 10.776 27.707 18.69q11.878 11.874 18.692 27.708a82 82 0 0 1 4.22 12.465a3.134 3.134 0 0 0 3.036 2.375a3.135 3.135 0 0 0 3.037-2.375a82 82 0 0 1 4.22-12.465c4.543-10.555 10.776-19.79 18.69-27.707c7.915-7.915 17.154-14.148 27.708-18.691a82 82 0 0 1 12.466-4.22a3.135 3.135 0 0 0 2.374-3.037a3.135 3.135 0 0 0-2.374-3.037a82 82 0 0 1-12.466-4.22"
            />
          </g>
        </svg>
      );
    case 'pr':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#180b26" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#ea77ff" strokeOpacity="0.4" strokeWidth="1.5" />
          <text
            x="10.5"
            y="32.5"
            fill="#ea77ff"
            fontFamily="'SF Pro Display', -apple-system, sans-serif"
            fontSize="22"
            fontWeight="700"
          >
            P
          </text>
          <text
            x="26"
            y="32.5"
            fill="#ea77ff"
            fontFamily="'SF Pro Display', -apple-system, sans-serif"
            fontSize="19"
            fontWeight="600"
          >
            r
          </text>
        </svg>
      );
    case 'react':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#161b22" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#00d8ff" strokeOpacity="0.35" strokeWidth="1.2" />
          <g stroke="#00d8ff" strokeWidth="1.8" fill="none">
            <ellipse cx="24" cy="24" rx="15" ry="5.8" />
            <ellipse cx="24" cy="24" rx="15" ry="5.8" transform="rotate(60 24 24)" />
            <ellipse cx="24" cy="24" rx="15" ry="5.8" transform="rotate(120 24 24)" />
          </g>
          <circle cx="24" cy="24" r="2.8" fill="#00d8ff" />
        </svg>
      );
    case 'python':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <defs>
            <linearGradient id="pyBlueGrad" gradientUnits="userSpaceOnUse" x1="20" y1="10" x2="70" y2="70">
              <stop offset="0%" stopColor="#5A9FD4" />
              <stop offset="100%" stopColor="#306998" />
            </linearGradient>
            <linearGradient id="pyYellowGrad" gradientUnits="userSpaceOnUse" x1="100" y1="110" x2="60" y2="50">
              <stop offset="0%" stopColor="#FFD43B" />
              <stop offset="100%" stopColor="#FFE873" />
            </linearGradient>
          </defs>
          {/* Scaled official Python dual snake (transparent background, enlarged to 41px, perfectly centered) */}
          <g transform="translate(-1.3, 2.6) scale(0.395)">
            {/* Blue Snake */}
            <path
              fill="url(#pyBlueGrad)"
              d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z"
            />
            {/* Yellow Snake */}
            <path
              fill="url(#pyYellowGrad)"
              d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z"
            />
          </g>
        </svg>
      );
    case 'java':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          {/* Scaled official Oracle Java Cup & Steam (straightened upright with -6.5deg rotation, centered) */}
          <g transform="translate(1.7, 2.8) scale(0.33) rotate(-6.5 63.7 64.5)">
            {/* Blue Saucer & Base elements */}
            <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z" />
            <path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z" />
            <path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z" />
            {/* Red Rising Steam waves */}
            <path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z" />
            <path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z" />
          </g>
        </svg>
      );
    case 'sql':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#111c24" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#00758f" strokeOpacity="0.35" strokeWidth="1.2" />
          {/* Database Stack */}
          <ellipse cx="24" cy="14" rx="13" ry="4" fill="#0097b2" />
          <ellipse cx="24" cy="14" rx="13" ry="4" stroke="#38bdf8" strokeWidth="1.2" fill="none" />
          
          <path
            d="M11 14v8c0 2.2 5.8 4 13 4s13-1.8 13-4v-8"
            stroke="#38bdf8"
            strokeWidth="1.5"
            fill="#00758f"
            fillOpacity="0.8"
          />
          <ellipse cx="24" cy="22" rx="13" ry="3.5" fill="#00869e" opacity="0.4" />

          <path
            d="M11 22v8c0 2.2 5.8 4 13 4s13-1.8 13-4v-8"
            stroke="#38bdf8"
            strokeWidth="1.5"
            fill="#025d73"
          />
          <ellipse cx="24" cy="30" rx="13" ry="3.5" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.8" />
        </svg>
      );

    case 'notion':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#ffffff" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#d4d0c5" strokeWidth="1.2" />
          <path
            d="M14.5 15.2c.8.6.8.8.8 2.2v14.1c0 1-.4 1.4-1.4 1.7l1.1.8h7.2l-1.1-.8c-1-.3-1.4-.7-1.4-1.7v-9.6l7.7 11.3c.7 1 1.3 1.3 2.5 1.3h4.6l-1.1-.9c-1-.3-1.4-.8-1.4-1.8V17.3c0-1.1.5-1.5 1.5-1.8l-1.1-.8h-6.7l1.1.8c.9.3 1.3.7 1.3 1.7v9.4L21 14.5h-6.5Z"
            fill="#18181b"
          />
        </svg>
      );
    case 'vscode':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#0c141f" />
          <rect x="1" y="1" width="46" height="46" rx="9" stroke="#007acc" strokeOpacity="0.4" strokeWidth="1.2" />
          {/* Scaled official Devicon VS Code (128x128 mapped to 30x30 centered at x=9, y=9) */}
          <g transform="translate(9, 9) scale(0.234)">
            {/* Wing 1 */}
            <path
              fill="#0065A9"
              d="M123.471 13.82 97.097 1.12A7.973 7.973 0 0 0 88 2.668L1.662 81.387a5.333 5.333 0 0 0 .006 7.887l7.052 6.411a5.333 5.333 0 0 0 6.811.303l103.971-78.875c3.488-2.646 8.498-.158 8.498 4.22v-.306a8.001 8.001 0 0 0-4.529-7.208Z"
            />
            {/* Wing 2 */}
            <path
              fill="#007ACC"
              d="m123.471 114.181-26.374 12.698A7.973 7.973 0 0 1 88 125.333L1.662 46.613a5.333 5.333 0 0 1 .006-7.887l7.052-6.411a5.333 5.333 0 0 1 6.811-.303l103.971 78.874c3.488 2.647 8.498.159 8.498-4.219v.306a8.001 8.001 0 0 1-4.529 7.208Z"
            />
            {/* Center folded ribbon */}
            <path
              fill="#1F9CF0"
              d="M97.098 126.882A7.977 7.977 0 0 1 88 125.333c2.952 2.952 8 .861 8-3.314V5.98c0-4.175-5.048-6.266-8-3.313a7.977 7.977 0 0 1 9.098-1.549L123.467 13.8A8 8 0 0 1 128 21.01v85.982a8 8 0 0 1-4.533 7.21l-26.369 12.681Z"
            />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

interface ArsenalStorageBoxProps {
  className?: string;
  onSelectSoftware?: (item: ArsenalItem) => void;
}

export const ArsenalStorageBox: React.FC<ArsenalStorageBoxProps> = ({
  className = '',
  onSelectSoftware,
}) => {
  const [hoveredItem, setHoveredItem] = useState<ArsenalItem | null>(null);
  const [activeItem, setActiveItem] = useState<ArsenalItem | null>(null);

  const handleItemClick = (item: ArsenalItem) => {
    if (activeItem?.id === item.id) {
      setActiveItem(null);
    } else {
      setActiveItem(item);
      onSelectSoftware?.(item);
    }
  };

  const displayedItem = hoveredItem || activeItem;

  return (
    <div className={`w-full flex flex-col gap-2 select-none ${className}`}>
      {/* Dynamic Active / Hover HUD Banner (Skill readout above the box) */}
      <div className="min-h-6 flex items-center justify-between px-1 text-[13px]">
        {displayedItem ? (
          <motion.div
            key={displayedItem.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 truncate"
          >
            <span className="font-bold text-[#292727] tracking-tight text-[13.5px]">
              {displayedItem.name}
            </span>
            <span className="text-[#8c867c] text-[13px]">·</span>
            <span className="text-[#59554e] text-[12.5px] truncate">
              {displayedItem.skillTitle}
            </span>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded font-medium border shrink-0 hidden sm:inline-block"
              style={{
                borderColor: `${displayedItem.highlightColor}40`,
                backgroundColor: displayedItem.accentBg,
                color: displayedItem.highlightColor,
              }}
            >
              {displayedItem.proficiency}
            </span>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 text-[#777373] text-[12.5px]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#bbb5a7]" />
            <span>轻触或悬停工具图标，检视技能与核心产出</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* THE PHYSICAL MULTI-ROW STORAGE BOX (加大图标拟物长收纳盒 / 实物托盘外壳与凹槽) */}
      {/* ======================================================== */}
      <div
        className="w-full relative rounded-2xl p-[6px] sm:p-[7px] box-border transition-all duration-300"
        style={{
          background: 'linear-gradient(180deg, #f0ece3 0%, #e6e1d6 100%)',
          boxShadow: `
            0 4px 14px rgba(41, 39, 39, 0.08),
            0 1px 3px rgba(41, 39, 39, 0.05),
            inset 0 1px 1px rgba(255, 255, 255, 0.9),
            inset 0 -1px 2px rgba(0, 0, 0, 0.1)
          `,
          border: '1px solid #dcd6c7',
        }}
      >
        {/* Decorative Tray Screws/Rivets on Corners (收纳盒金属沉孔工艺细节) */}
        <div className="absolute top-1.5 left-2 w-1.5 h-1.5 rounded-full bg-[#cbc5b6] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.3)] border border-[#dfd9cb]/80" />
        <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#cbc5b6] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.3)] border border-[#dfd9cb]/80" />
        <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 rounded-full bg-[#cbc5b6] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.3)] border border-[#dfd9cb]/80" />
        <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#cbc5b6] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.3)] border border-[#dfd9cb]/80" />

        {/* Sunken Inner Compartment Bed (内嵌深凹槽底座) */}
        <div
          className="w-full rounded-[12px] p-2.5 sm:p-3 box-border relative"
          style={{
            background: 'linear-gradient(180deg, #ded9cd 0%, #e3ded2 100%)',
            boxShadow: `
              inset 0 3px 6px rgba(0, 0, 0, 0.13),
              inset 0 1px 2px rgba(0, 0, 0, 0.08),
              inset 0 -1px 1px rgba(255, 255, 255, 0.75)
            `,
          }}
        >
          {/* Subtle velvet cushion lining texture */}
          <div className="absolute inset-0 rounded-[12px] pointer-events-none opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />

          {/* MULTI-ROW GRID: 4 columns x 3 rows with LARGE ICONS (NO LABELS) */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full relative z-10 justify-items-center">
            {ARSENAL_ITEMS.map((item) => {
              const isHovered = hoveredItem?.id === item.id;
              const isActive = activeItem?.id === item.id;
              const isSelected = isHovered || isActive;

              return (
                <button
                  key={item.id}
                  type="button"
                  title={`${item.name} · ${item.skillTitle}`}
                  aria-label={`${item.name} (${item.skillTitle})`}
                  className="w-full relative flex flex-col items-center group cursor-pointer focus:outline-none"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleItemClick(item)}
                >
                  {/* 1. Recessed Slot Cradle (大尺寸模切收纳凹槽 / 卡位) */}
                  <div
                    className="w-full aspect-square max-w-[66px] max-h-[66px] sm:max-w-[70px] sm:max-h-[70px] rounded-2xl flex items-center justify-center relative transition-all duration-200"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.68)' : 'rgba(215, 209, 198, 0.55)',
                      boxShadow: isSelected
                        ? `inset 0 1px 3px rgba(0,0,0,0.18), 0 0 0 2px ${item.highlightColor}, 0 4px 12px rgba(0,0,0,0.12)`
                        : 'inset 0 2px 4px rgba(0,0,0,0.18), inset 0 -1px 1.5px rgba(255,255,255,0.7)',
                    }}
                  >
                    {/* Empty slot outline watermark (shows when tool is lifted) */}
                    <div className="absolute inset-1 rounded-xl border border-dashed border-[#b8b1a3]/60 pointer-events-none" />

                    {/* 2. Physical Tool Icon Badge (大图标拟物徽章 / 增大悬停放大倍率至 1.38) */}
                    <motion.div
                      animate={{
                        y: isSelected ? -10 : 0,
                        scale: isSelected ? 1.38 : 1,
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.38,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 19,
                      }}
                      className="relative w-12 h-12 sm:w-[52px] sm:h-[52px] flex items-center justify-center rounded-2xl cursor-pointer"
                      style={{
                        zIndex: isSelected ? 40 : 10,
                        filter: isSelected
                          ? 'drop-shadow(0 14px 20px rgba(0,0,0,0.32)) drop-shadow(0 4px 7px rgba(0,0,0,0.20))'
                          : 'drop-shadow(0 2px 3.5px rgba(0,0,0,0.15))',
                      }}
                    >
                      <SoftwareIcon type={item.iconType} className="w-full h-full object-contain pointer-events-none" />
                    </motion.div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expandable / Clicked Detail Card (点击展开详细技能解读) */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-[#fcfbf7] border border-[#e2ddd1] rounded-xl p-2.5 sm:p-3 shadow-sm flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-[#292727] text-[14px] shrink-0">
                    {activeItem.name}
                  </span>
                  <span className="text-[#777373] text-[12px] truncate">
                    {activeItem.category}
                  </span>
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded font-medium border shrink-0"
                    style={{
                      borderColor: `${activeItem.highlightColor}40`,
                      backgroundColor: activeItem.accentBg,
                      color: activeItem.highlightColor,
                    }}
                  >
                    {activeItem.proficiency}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="text-[#777373] hover:text-[#292727] text-[12px] px-1.5 py-0.5 rounded cursor-pointer transition-colors shrink-0"
                >
                  ✕ 关闭
                </button>
              </div>

              <div className="text-[#3f3b35] font-medium text-[12.5px] leading-snug">
                {activeItem.skillTitle}
              </div>

              <p className="text-[#59554e] leading-relaxed text-[12px] mt-0.5">
                {activeItem.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
