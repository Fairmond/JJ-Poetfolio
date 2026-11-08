import React from 'react';
import { ParallaxCoords } from '../../hooks/useParallax';

interface MobileHeroFrameProps {
  renderPos: ParallaxCoords;
}

export const MobileHeroFrame: React.FC<MobileHeroFrameProps> = ({ renderPos }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 393 640"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-full object-contain select-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <style>{`
            @font-face {
              font-family: 'CopperplateGothic-Bold';
              src: url('/fonts/COPRGTB.TTF') format('truetype');
              font-weight: 700;
              font-display: swap;
            }
            @font-face {
              font-family: 'Copperplate Gothic';
              src: url('/fonts/COPRGTB.TTF') format('truetype');
              font-weight: 700;
              font-display: swap;
            }
            @font-face {
              font-family: 'Copperplate';
              src: url('/fonts/COPRGTB.TTF') format('truetype');
              font-weight: 700;
              font-display: swap;
            }
            @font-face {
              font-family: 'FZFYSJW';
              src: url('/fonts/FZFYSJW.TTF') format('truetype');
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
            @font-face {
              font-family: '方正风雅宋简体';
              src: url('/fonts/FZFYSJW.TTF') format('truetype');
              font-weight: 100 900;
              font-display: swap;
            }
          `}</style>

          {/* Floating Title Elevated Depth Shadow / 悬浮立体景深阴影 (淡化通透) */}
          <filter id="mobileTitleFloatingShadow" x="-30%" y="-30%" width="180%" height="180%">
            <feDropShadow dx="3" dy="7" stdDeviation="7" floodColor="#1e1815" floodOpacity="0.14" />
            <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#1e1815" floodOpacity="0.09" />
          </filter>

          {/* Bottom Portrait Clipping Path */}
          <clipPath id="mobile-clip-bottom-photo">
            <path
              fill="#fff"
              stroke="#707070"
              d="M69.454 19.49 263.238.003l-15.449 296.13L.003 263.465Z"
              opacity={0.54}
            />
          </clipPath>

          {/* Upper Portrait Cutout Clipping Path */}
          <clipPath id="mobile-clip-top-photo">
            <path
              fill="#fff"
              stroke="#707070"
              d="M47.065 0h220.43L248.43 350.902 0 316.944Z"
              opacity={0.54}
            />
          </clipPath>

          {/* Tape blur filter */}
          <filter id="mobileTapeBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>

          {/* Mobile Badge Drop Shadow */}
          <filter id="mobileBadgeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="6" stdDeviation="9" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          {/* Holographic Specular Moving Sheen Linear Gradient */}
          <linearGradient id="mobileHoloSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="58%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Mobile Badge Circular Clipping Mask (Center: 1732.375, 735.429, Radius: 48.491) */}
          <clipPath id="mobileBadgeCircleClip">
            <circle cx={1732.375} cy={735.429} r={48.491} />
          </clipPath>

          {/* Torn Paper Pattern */}
          <pattern
            id="mobile-pattern-torn"
            width={1}
            height={1}
            viewBox="0 16.037 693.541 197.835"
          >
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              width={749.761}
              height={213.872}
              preserveAspectRatio="none"
            />
          </pattern>
        </defs>

        {/* Rotated Torn Paper Strip Layer - shifted upward */}
        <g transform={`translate(${renderPos.x * 12} ${-26 + renderPos.y * 12})`}>
          <g transform="rotate(-40.0 363.905 379.456)">
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              x={-120 - 745}
              y={-20}
              width={750}
              height={214}
              preserveAspectRatio="none"
            />
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              x={-120}
              y={-20}
              width={750}
              height={214}
              preserveAspectRatio="none"
            />
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              x={-120 + 745}
              y={-20}
              width={750}
              height={214}
              preserveAspectRatio="none"
            />
          </g>
        </g>

        {/* Display Headline & Subtitle - Scaled +30%, nudged down 1/4 body position with floating shadow */}
        <g
          transform="translate(8 -11) translate(28 124) scale(1.3) translate(-28 -124)"
          filter="url(#mobileTitleFloatingShadow)"
        >
          <g transform="translate(28 0)">
            <text
              fill="#292727"
              fontFamily="CopperplateGothic-Bold, 'Copperplate Gothic', 'Playfair Display', serif"
              style={{
                fontFamily: "CopperplateGothic-Bold, 'Copperplate Gothic', 'Playfair Display', serif",
              }}
              fontSize={44}
              fontWeight={700}
              letterSpacing={0.8}
              x={0}
              y={124}
            >
              <tspan>This </tspan>
              <tspan fill="#ffffff">is</tspan>
              <tspan xmlSpace="preserve"> me</tspan>
            </text>

            <text
              fill="#292727"
              fontFamily="'FZFYSJW', 'FZFYSJW--GB1-0', 'FZFengYaSongS-GB', '方正风雅宋简体', '方正风雅宋简', serif"
              style={{
                fontFamily: "'FZFYSJW', 'FZFYSJW--GB1-0', 'FZFengYaSongS-GB', '方正风雅宋简体', '方正风雅宋简', serif",
              }}
              fontSize={30}
              x={0}
              y={168}
            >
              这是我
            </text>
          </g>
        </g>

        {/* 3D HERO FRAME PACKAGE - Scaled +5% (0.92 * 1.05 = 0.966), shifted upward slightly */}
        <g transform="translate(0 -16) translate(196.5 375) scale(0.966) translate(-196.5 -375)">
          <g
            transform={`translate(${-1051 + renderPos.x * 22} ${-21.038 + renderPos.y * 22})`}
            className="group select-none pointer-events-auto"
          >
            {/* Layer 1: Bottom Portrait Studio Background */}
            <g
              clipPath="url(#mobile-clip-bottom-photo)"
              transform="translate(1100.563 269.994)"
            >
              <image
                href="/mobile_portrait_bottom.png"
                xlinkHref="/mobile_portrait_bottom.png"
                width={306}
                height={408}
                transform={`translate(${-12.563 - renderPos.x * 14} ${-57.956 - renderPos.y * 14})`}
              />
            </g>

            {/* Layer 2: 3D Frame & Outer Shadow */}
            <image
              href="/mobile_frame.png"
              xlinkHref="/mobile_frame.png"
              width={373}
              height={463}
              transform="translate(1040 170.038)"
              className="pointer-events-none"
            />

            {/* Layer 3: Tape bar / Shadow */}
            <rect
              width={136.328}
              height={17.167}
              fill="#8d8d8d"
              rx={8.584}
              filter="url(#mobileTapeBlur)"
              style={{
                mixBlendMode: 'multiply',
                isolation: 'isolate',
              }}
              transform="rotate(-6.02 3181.999 -11001.704)"
            />

            {/* Layer 4: Upper Cutout Portrait */}
            <g
              clipPath="url(#mobile-clip-top-photo)"
              transform="translate(1100.485 216.921)"
            >
              <image
                href="/mobile_portrait_top.png"
                xlinkHref="/mobile_portrait_top.png"
                width={287.05}
                height={393.62}
                transform={`translate(${7.925 - renderPos.x * 18} ${12.392 - renderPos.y * 18})`}
              />
            </g>
          </g>

          {/* Circular Holographic Badge / Stamp Avatar (Upper Layer: Opposite Parallax Direction) */}
          <g
            transform={`translate(${-1418.955 - renderPos.x * 26} ${-228.976 - renderPos.y * 26})`}
            filter="url(#mobileBadgeShadow)"
          >
            <circle
              cx={48.491}
              cy={48.491}
              r={48.491}
              fill="#e4e4e4"
              transform="translate(1683.884 686.938)"
            />
            <image
              href="/mobile_avatar_badge.png"
              xlinkHref="/mobile_avatar_badge.png"
              width={97.301}
              height={97.196}
              transform="translate(1683.654 686.814)"
            />

            {/* Holographic Iridescent Sheen Layers / 镭射流光与虹彩视差蒙版层 */}
            <g clipPath="url(#mobileBadgeCircleClip)">
              {/* 1. Realistic Holographic Rainbow Texture: color-dodge blend with dynamic parallax shift & rotation */}
              <image
                href="/holo_texture.png"
                xlinkHref="/holo_texture.png"
                x={1683.654 - 50}
                y={686.814 - 50}
                width={97.301 + 100}
                height={97.196 + 100}
                preserveAspectRatio="xMidYMid slice"
                style={{
                  mixBlendMode: 'color-dodge',
                  opacity: 0.38,
                  transform: `translate(${renderPos.x * 48}px, ${renderPos.y * 48}px) rotate(${renderPos.x * 45}deg)`,
                  transformOrigin: '1732.375px 735.429px',
                }}
              />

              {/* 2. Specular Holographic Glare Sheen Line: overlay blend with opposite sweep */}
              <rect
                x={1683.654 - 40}
                y={686.814 - 40}
                width={97.301 + 80}
                height={97.196 + 80}
                fill="url(#mobileHoloSheen)"
                style={{
                  mixBlendMode: 'overlay',
                  opacity: 0.35,
                  transform: `translate(${-renderPos.x * 56}px, ${-renderPos.y * 56}px) rotate(${45 + renderPos.y * 35}deg)`,
                  transformOrigin: '1732.375px 735.429px',
                }}
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
