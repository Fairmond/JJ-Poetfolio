import React, { useState, useRef } from 'react';
import { ProjectItem, ContactType } from '../types';
import { PC_CANVAS_WIDTH, PC_CANVAS_HEIGHT, PC_DRAWER, PC_HERO_FRAME } from '../constants/layout';
import { useStageMetrics } from '../hooks/useStageMetrics';
import { useParallax } from '../hooks/useParallax';
import { PcHeader } from './pc/PcHeader';
import { PcSvgDefs } from './pc/PcSvgDefs';
import { PcHeroFrame } from './pc/PcHeroFrame';
import { PcDrawer } from './pc/PcDrawer';

interface SvgCanvasProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onSelectProject: (project: ProjectItem) => void;
  onOpenContact: (type: ContactType) => void;
}

export const SvgCanvas: React.FC<SvgCanvasProps> = ({
  isDrawerOpen,
  setIsDrawerOpen,
  onSelectProject,
  onOpenContact,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [photoHovered, setPhotoHovered] = useState(false);

  // Hook 1: Adaptive Stage Contain Scaler & Viewport Coordinates
  const stageMetrics = useStageMetrics(containerRef);

  // Hook 2: Parallax physics loop with inertia & lerp damping
  const { renderPos, handleMouseMove, handleMouseLeave } = useParallax({ damping: 0.11 });

  // -------------------------------------------------------------
  // Dynamic Responsive Drawer & Frame Coordinates
  // -------------------------------------------------------------
  // Right half center:
  const rightHalfCenter = (PC_CANVAS_WIDTH / 2) + (stageMetrics.windowRightInCanvas - (PC_CANVAS_WIDTH / 2)) / 2;

  // Drawer 3% margin:
  const safeMargin3Percent = PC_DRAWER.PANEL_WIDTH * PC_DRAWER.SAFE_MARGIN_RATIO; // 26.1px
  const openTargetShiftX = stageMetrics.windowRightInCanvas - PC_DRAWER.PANEL_RIGHT_X - safeMargin3Percent;

  // Drawer translation:
  const drawerShiftX = isDrawerOpen
    ? openTargetShiftX
    : stageMetrics.windowRightInCanvas - PC_DRAWER.PANEL_HANDLE_ROOT_X;

  // Central Hero Frame placement:
  // 1. When drawer is OPEN: frame sits exactly halfway between window left and drawer left
  const drawerLeftInCanvas = PC_DRAWER.PANEL_ORIGIN_X + openTargetShiftX;
  const targetFrameCenter = (stageMetrics.windowLeftInCanvas + drawerLeftInCanvas) / 2;
  const openFrameShiftX = targetFrameCenter - PC_HERO_FRAME.ORIGIN_CENTER;

  // 2. When drawer is CLOSED: frame sits in the right half of the screen offset by 10%
  const shift5Percent = (stageMetrics.windowRightInCanvas - (PC_CANVAS_WIDTH / 2)) * 0.10;
  const baseFrameShiftX = rightHalfCenter - PC_HERO_FRAME.ORIGIN_CENTER - shift5Percent;

  const frameShiftX = isDrawerOpen ? openFrameShiftX : baseFrameShiftX;

  return (
    <div
      ref={containerRef}
      id="pc-stage-root"
      className="relative w-full h-full min-h-[100dvh] flex items-center justify-center select-none bg-[#eae8e4] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Fixed Header Navigation (Pinned strictly to window top edge) */}
      <PcHeader scale={stageMetrics.scale} onOpenContact={onOpenContact} />

      {/* GPU Scaled Vector Artboard */}
      <div
        id="pc-stage-scaler"
        className="transition-transform duration-500 ease-out origin-center will-change-transform flex items-center justify-center pointer-events-auto"
        style={{
          width: PC_CANVAS_WIDTH,
          height: PC_CANVAS_HEIGHT,
          transform: `translate3d(${stageMetrics.panX}px, ${stageMetrics.panY}px, 0px) scale(${stageMetrics.scale})`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox={`0 0 ${PC_CANVAS_WIDTH} ${PC_CANVAS_HEIGHT}`}
          width={PC_CANVAS_WIDTH}
          height={PC_CANVAS_HEIGHT}
          className="w-[1920px] h-[1088px] block select-none overflow-visible"
          style={{ overflow: 'visible' }}
        >
          {/* SVG Definitions, Filters & Clipping Paths */}
          <PcSvgDefs isDrawerOpen={isDrawerOpen} />

          {/* Base Background Color (Full Coordinate Extended to seamlessly fit window edges) */}
          <path fill="#eae8e4" d="M-5000 -5000h12000v12000H-5000z" />

          {/* Main Stage Content Group */}
          <g id="pc-stage-content">
            <path fill="#eae8e4" d="M-2000 -2000h6000v6000H-2000z" />

            {/* Torn Paper Strip Rotated Texture with Mouse Parallax */}
            <g
              style={{
                transform: `translate3d(${renderPos.x * 36}px, ${renderPos.y * 36}px, 0)`,
              }}
            >
              <g
                transform={`rotate(-70 ${stageMetrics.tornCenterX} 544)`}
                className="transition-all duration-300"
                opacity={isDrawerOpen ? 0.3 : 1}
              >
                <image
                  href="/pc_bg_torn.png"
                  xlinkHref="/pc_bg_torn.png"
                  x={stageMetrics.tornCenterX - 750 - 1490}
                  y={329}
                  width={1500}
                  height={430}
                  preserveAspectRatio="none"
                />
                <image
                  href="/pc_bg_torn.png"
                  xlinkHref="/pc_bg_torn.png"
                  x={stageMetrics.tornCenterX - 750}
                  y={329}
                  width={1500}
                  height={430}
                  preserveAspectRatio="none"
                />
                <image
                  href="/pc_bg_torn.png"
                  xlinkHref="/pc_bg_torn.png"
                  x={stageMetrics.tornCenterX - 750 + 1490}
                  y={329}
                  width={1500}
                  height={430}
                  preserveAspectRatio="none"
                />
              </g>
            </g>

            {/* Main Left Typography: "This is me" & "这是我" */}
            <g
              mask="url(#textFadeMask)"
              className="transition-all duration-500 ease-in-out"
              transform={`translate(${stageMetrics.titleX}, 482) scale(${stageMetrics.titleScale * 0.85}) translate(-196, -482)`}
              opacity={isDrawerOpen ? 0 : 1}
              style={{ pointerEvents: isDrawerOpen ? 'none' : 'auto' }}
            >
              <text
                fill="#292727"
                fontFamily="Copperplate, CopperplateGothic-Bold, 'Copperplate Gothic', 'Playfair Display', serif"
                fontSize={160}
                fontWeight={700}
                filter="url(#titleSoftShadow)"
                transform="translate(196 482)"
              >
                <tspan x={0} y={0}>
                  {"This "}
                </tspan>
                <tspan y={0} fill="#ffffff">
                  {"is"}
                </tspan>
                <tspan xmlSpace="preserve" y={0}>
                  {" me"}
                </tspan>
              </text>

              <text
                fill="#292727"
                fontFamily="MicrosoftJhengHeiUIBold, 'Microsoft JhengHei UI', sans-serif"
                fontSize={100}
                filter="url(#titleSoftShadow)"
                transform="translate(196 626)"
              >
                <tspan x={0} y={0}>
                  {"这"}
                </tspan>
                <tspan
                  y={0}
                  fontFamily="YuGothicUI-Bold, 'Yu Gothic UI', sans-serif"
                  fontWeight={700}
                >
                  {"是我"}
                </tspan>
              </text>
            </g>

            {/* Opaque Backdrop Overlay (Right-to-Left Transition, closes drawer on backdrop click) */}
            <g
              className="transition-transform duration-500 ease-in-out cursor-pointer"
              style={{
                transform: isDrawerOpen ? 'translate(0px, 0px)' : 'translate(3000px, 0px)',
                pointerEvents: isDrawerOpen ? 'auto' : 'none',
              }}
              onClick={() => setIsDrawerOpen(false)}
            >
              <rect x="-600" y="-1000" width="600" height="3200" fill="url(#bgOverlayEdgeGradient)" />
              <rect x="0" y="-1000" width="3000" height="3200" fill="#f5f3ed" />
            </g>

            {/* 1. HERO FRAME PACKAGE */}
            <PcHeroFrame
              frameShiftX={frameShiftX}
              renderPos={renderPos}
              photoHovered={photoHovered}
              setPhotoHovered={setPhotoHovered}
            />

            {/* 2. SLIDE DRAWER PACKAGE */}
            <PcDrawer
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              drawerShiftX={drawerShiftX}
              onSelectProject={onSelectProject}
              onOpenContact={onOpenContact}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
