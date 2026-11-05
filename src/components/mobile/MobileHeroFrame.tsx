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
        className="w-full h-full max-h-full object-contain drop-shadow-sm select-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
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

        {/* Rotated Torn Paper Strip Layer */}
        <g transform={`translate(${renderPos.x * 14} ${-145 + renderPos.y * 14})`}>
          <g transform="rotate(-40.0 363.905 379.456)">
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              x={-120 - 1070}
              y={-20}
              width={1080}
              height={294}
              preserveAspectRatio="none"
            />
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              x={-120}
              y={-20}
              width={1080}
              height={294}
              preserveAspectRatio="none"
            />
            <image
              href="/mobile_bg_torn.png"
              xlinkHref="/mobile_bg_torn.png"
              x={-120 + 1070}
              y={-20}
              width={1080}
              height={294}
              preserveAspectRatio="none"
            />
          </g>
        </g>

        {/* Display Headline & Subtitle */}
        <g transform="translate(196.5 45) scale(1.2) translate(-196.5 -160)">
          <g transform="translate(28 0)">
            <text
              fill="#292727"
              fontFamily="CopperplateGothic-Bold, 'Copperplate Gothic', 'Playfair Display', serif"
              fontSize={63}
              fontWeight={700}
              x={0}
              y={160}
            >
              <tspan>This </tspan>
              <tspan fill="#ffffff">is</tspan>
              <tspan xmlSpace="preserve"> me</tspan>
            </text>

            <text
              fill="#292727"
              fontFamily="FZFYSJW--GB1-0, FZFengYaSongS-GB, 'Songti SC', serif"
              fontSize={40}
              x={0}
              y={216}
            >
              这是我
            </text>
          </g>
        </g>

        {/* 3D HERO FRAME PACKAGE */}
        <g transform="translate(196.5 365) scale(1.32) translate(-196.5 -365)">
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

          {/* Circular Holographic Badge / Stamp Avatar */}
          <g
            transform={`translate(${-1418.955 - renderPos.x * 26} ${-228.976 - renderPos.y * 26})`}
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
          </g>
        </g>
      </svg>
    </div>
  );
};
