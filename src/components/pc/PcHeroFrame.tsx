import React from 'react';
import { ParallaxCoords } from '../../hooks/useParallax';

interface PcHeroFrameProps {
  frameShiftX: number;
  renderPos: ParallaxCoords;
  photoHovered: boolean;
  setPhotoHovered: (hovered: boolean) => void;
}

export const PcHeroFrame: React.FC<PcHeroFrameProps> = ({
  frameShiftX,
  renderPos,
  photoHovered,
  setPhotoHovered,
}) => {
  return (
    <g
      id="hero-frame-package"
      className="transition-transform duration-500 ease-out"
      style={{
        transform: `translate3d(${frameShiftX}px, 0px, 0px)`,
      }}
    >
      {/* Layer 1: Frame Stack (Lower Parallax Layer: Same Direction as Lower Layer / 与下层撕纸纹理同向) */}
      <g
        style={{
          transform: `translate3d(${renderPos.x * 36}px, ${renderPos.y * 36}px, 0)`,
        }}
      >
        <g
          transform="translate(-80, -72)"
          className="group"
          onMouseEnter={() => setPhotoHovered(true)}
          onMouseLeave={() => setPhotoHovered(false)}
        >
          {/* Base Portrait Image clipped (id="c") - Inner image keeps fixed relative to canvas via counter-parallax */}
          <g clipPath="url(#c)">
            <g
              style={{
                transform: `translate3d(${-renderPos.x * 36}px, ${-renderPos.y * 36}px, 0)`,
              }}
            >
              <g transform="translate(1134 254)">
                <image
                  xlinkHref="/pc_portrait_bottom.png"
                  href="/pc_portrait_bottom.png"
                  width={610}
                  height={813}
                  className="transition-transform duration-500"
                  style={{
                    transform: photoHovered ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: '305px 406.5px',
                  }}
                />
              </g>
            </g>
          </g>

          {/* Polaroid Frame / Outer Texture (Moves with frame/lower layer) */}
          <image
            xlinkHref="/pc_frame.png"
            href="/pc_frame.png"
            width={740}
            height={918}
            transform="translate(1040 170)"
          />

          {/* Tape Overlay (Rounded Rectangle) - Keeps fixed relative to canvas via counter-parallax */}
          <g
            style={{
              transform: `translate3d(${-renderPos.x * 36}px, ${-renderPos.y * 36}px, 0)`,
            }}
          >
            <rect
              width={270}
              height={34}
              fill="#8d8d8d"
              rx={17}
              filter="url(#tapeBlur)"
              style={{
                mixBlendMode: 'multiply',
                isolation: 'isolate',
              }}
              transform="rotate(-6.02 4209.17 -12187.409)"
            />
          </g>

          {/* Inner Cutout Photo (id="d") - Inner portrait keeps fixed relative to canvas via counter-parallax */}
          <g clipPath="url(#d)">
            <g
              style={{
                transform: `translate3d(${-renderPos.x * 36}px, ${-renderPos.y * 36}px, 0)`,
              }}
            >
              <image
                xlinkHref="/pc_portrait_top.png"
                href="/pc_portrait_top.png"
                width={568.508}
                height={779.984}
                transform="translate(1175.488 287.46)"
              />
            </g>
          </g>
        </g>
      </g>

      {/* Layer 2: Circular Stamp / Holographic Badge (Upper Layer: Opposite Parallax Direction / 上层反向视差) */}
      <g
        style={{
          transform: `translate3d(${-renderPos.x * 18}px, ${-renderPos.y * 18}px, 0)`,
        }}
      >
        <g
          transform="translate(-157.002, 46.186)"
          filter="url(#badgeShadow)"
        >
          <circle
            cx={86.389}
            cy={86.389}
            r={86.389}
            fill="#e4e4e4"
            transform="translate(1684.063 687.034)"
          />
          <image
            xlinkHref="/pc_avatar_badge.png"
            href="/pc_avatar_badge.png"
            width={173.348}
            height={173.162}
            transform="translate(1683.654 686.814)"
          />

          {/* Holographic Iridescent Sheen Layers / 镭射流光与虹彩高光层 */}
          <g clipPath="url(#badgeCircleClip)">
            {/* 1. Realistic Holographic Texture: color-dodge blend (Scaled to 200%) */}
            <image
              href="/holo_texture.png"
              xlinkHref="/holo_texture.png"
              x={1683.654 - 90}
              y={686.814 - 90}
              width={173.348 + 180}
              height={173.162 + 180}
              preserveAspectRatio="xMidYMid slice"
              style={{
                mixBlendMode: 'color-dodge',
                opacity: 0.275,
                transform: `translate(${renderPos.x * 85}px, ${renderPos.y * 85}px) rotate(${renderPos.x * 55}deg) scale(2)`,
                transformOrigin: '1770.452px 773.423px',
              }}
            />

            {/* 2. Metallic Sheen Highlight */}
            <rect
              x={1683.654 - 70}
              y={686.814 - 70}
              width={173.348 + 140}
              height={173.162 + 140}
              fill="url(#holoSheen)"
              style={{
                mixBlendMode: 'overlay',
                opacity: 0.25,
                transform: `translate(${-renderPos.x * 100}px, ${-renderPos.y * 100}px) rotate(${45 + renderPos.y * 40}deg)`,
                transformOrigin: '1770.452px 773.423px',
              }}
            />
          </g>
        </g>
      </g>
    </g>
  );
};
