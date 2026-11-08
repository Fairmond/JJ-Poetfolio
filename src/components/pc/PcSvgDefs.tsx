import React from 'react';

interface PcSvgDefsProps {
  isDrawerOpen: boolean;
}

export const PcSvgDefs: React.FC<PcSvgDefsProps> = ({ isDrawerOpen }) => {
  return (
    <defs>
      <style>{`
        @font-face {
          font-family: 'CopperplateGothic-Bold';
          src: url('/fonts/COPRGTB.TTF') format('truetype');
          font-weight: 100 900;
          font-display: swap;
        }
        @font-face {
          font-family: 'Copperplate Gothic';
          src: url('/fonts/COPRGTB.TTF') format('truetype');
          font-weight: 100 900;
          font-display: swap;
        }
        @font-face {
          font-family: 'Copperplate';
          src: url('/fonts/COPRGTB.TTF') format('truetype');
          font-weight: 100 900;
          font-display: swap;
        }
        @font-face {
          font-family: 'FZFYSJW--GB1-0';
          src: url('/fonts/FZFYSJW.TTF') format('truetype');
          font-weight: 100 900;
          font-display: swap;
        }
        @font-face {
          font-family: 'FZFengYaSongS-GB';
          src: url('/fonts/FZFYSJW.TTF') format('truetype');
          font-weight: 100 900;
          font-display: swap;
        }
      `}</style>
      <filter id="badgeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="6" dy="12" stdDeviation="18" floodColor="#000000" floodOpacity="0.28" />
      </filter>
      <filter id="titleSoftShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.14" />
      </filter>
      <filter id="tapeBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <linearGradient id="holoSpectrum" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff007f" stopOpacity="0.8" />
        <stop offset="20%" stopColor="#ff9900" stopOpacity="0.8" />
        <stop offset="40%" stopColor="#00ffcc" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#0066ff" stopOpacity="0.8" />
        <stop offset="80%" stopColor="#9900ff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ff007f" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="holoSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="42%" stopColor="#ffffff" stopOpacity="0.08" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="58%" stopColor="#ffffff" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <clipPath id="badgeCircleClip">
        <circle cx={1770.452} cy={773.423} r={86.389} />
      </clipPath>

      {/* Drawer Mask Clip: Strict mask within drawer card boundary (x: 1928, y: 107, w: 870, h: 943, rx: 8) */}
      <clipPath id="drawerMaskClip">
        <rect x={1928} y={107} width={870} height={943} rx={8} />
      </clipPath>

      {/* Mask & Gradient for Right-to-Left Text Fade Out */}
      <linearGradient id="textFadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="bgOverlayEdgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f5f3ed" stopOpacity="0" />
        <stop offset="100%" stopColor="#f5f3ed" stopOpacity="1" />
      </linearGradient>
      <mask id="textFadeMask" maskUnits="userSpaceOnUse" x="-500" y="100" width="3000" height="800">
        <g
          className="transition-transform duration-500 ease-in-out"
          style={{
            transform: isDrawerOpen ? 'translate(-1600px, 0px)' : 'translate(0px, 0px)',
          }}
        >
          <rect x="-500" y="100" width="2100" height="800" fill="#ffffff" />
          <rect x="1600" y="100" width="400" height="800" fill="url(#textFadeGradient)" />
        </g>
      </mask>
      <clipPath id="c">
        <path
          fill="#fff"
          stroke="#707070"
          d="m1297.5 406.633 383.794-38.6-30.6 586.5-490.751-64.7Z"
          opacity={0.54}
        />
      </clipPath>
      <clipPath id="d">
        <path
          fill="#fff"
          stroke="#707070"
          d="M1253.005 262.918h436.566l-37.758 694.965-492.021-67.255Z"
          opacity={0.54}
        />
      </clipPath>
      <clipPath id="a">
        <path d="M0 0h1920v1088H0z" />
      </clipPath>
      <pattern id="b" width={1} height={1} viewBox="0 29.169 1263.572 359.831">
        <image
          xlinkHref="/pc_bg_torn.png"
          href="/pc_bg_torn.png"
          width={1366}
          height={389}
          preserveAspectRatio="none"
        />
      </pattern>
      <pattern
        id="e"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 164 232"
      >
        <image
          xlinkHref="/pc_card_image.png"
          href="/pc_card_image.png"
          width={164}
          height={232}
        />
      </pattern>
      <radialGradient
        id="g"
        cx={0.044}
        cy={0.475}
        r={0.5}
        gradientUnits="objectBoundingBox"
      >
        <stop offset={0} stopColor="#f2f0eb" />
        <stop offset={0.82} stopColor="#efede8" />
        <stop offset={1} stopColor="#e6e4df" />
      </radialGradient>
      <filter
        id="f"
        width={981.695}
        height={980.402}
        x={1835.043}
        y={91.808}
        filterUnits="userSpaceOnUse"
      >
        <feOffset dy={3} />
        <feGaussianBlur result="g" stdDeviation={4} />
        <feFlood floodOpacity={0.149} />
        <feComposite in2="g" operator="in" />
        <feComposite in="SourceGraphic" />
      </filter>

      {/* Authentic Pixel Mosaic Mask Pattern */}
      <pattern
        id="realMosaicPattern"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <rect x="0"  y="0"  width="8" height="8" fill="#32302f" />
        <rect x="8"  y="0"  width="8" height="8" fill="#bfaea2" />
        <rect x="16" y="0"  width="8" height="8" fill="#635d58" />
        <rect x="24" y="0"  width="8" height="8" fill="#e2ded8" />
        <rect x="0"  y="8"  width="8" height="8" fill="#8c837b" />
        <rect x="8"  y="8"  width="8" height="8" fill="#242221" />
        <rect x="16" y="8"  width="8" height="8" fill="#eeebe6" />
        <rect x="24" y="8"  width="8" height="8" fill="#4d4845" />
        <rect x="0"  y="16" width="8" height="8" fill="#d4cec6" />
        <rect x="8"  y="16" width="8" height="8" fill="#5e5854" />
        <rect x="16" y="16" width="8" height="8" fill="#1f1d1d" />
        <rect x="24" y="16" width="8" height="8" fill="#9c938a" />
        <rect x="0"  y="24" width="8" height="8" fill="#423e3b" />
        <rect x="8"  y="24" width="8" height="8" fill="#e8e4dd" />
        <rect x="16" y="24" width="8" height="8" fill="#756f68" />
        <rect x="24" y="24" width="8" height="8" fill="#2b2827" />

        <path
          d="M0 8h32M0 16h32M0 24h32M8 0v32M16 0v32M24 0v32"
          stroke="#000000"
          strokeOpacity="0.12"
          strokeWidth="0.75"
        />
      </pattern>
    </defs>
  );
};
