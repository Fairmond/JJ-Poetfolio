import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectItem, ContactType } from '../../types';
import { PROJECTS_DATA } from '../../data/projectsData';
import { RealCalculatedMosaic } from '../RealCalculatedMosaic';
import { ArsenalStorageBox } from '../ArsenalStorageBox';
import { BioAutoScrollList } from '../BioAutoScrollList';

interface PcDrawerProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  drawerShiftX: number;
  onSelectProject: (project: ProjectItem) => void;
  onOpenContact: (type: ContactType) => void;
}

export const PcDrawer: React.FC<PcDrawerProps> = ({
  isDrawerOpen,
  setIsDrawerOpen,
  drawerShiftX,
  onSelectProject,
  onOpenContact,
}) => {
  const [isDrawerHovered, setIsDrawerHovered] = useState(false);
  const [isArrowBouncing, setIsArrowBouncing] = useState(false);
  const hasOpenedRef = useRef(false);

  // Hover states for expandable preview cards
  const [isLifaHovered, setIsLifaHovered] = useState(false);
  const lifaHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isCoachHovered, setIsCoachHovered] = useState(false);
  const coachHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bioScrollRef = useRef<HTMLDivElement>(null);

  const handleLifaMouseEnter = () => {
    if (coachHoverTimeoutRef.current) clearTimeout(coachHoverTimeoutRef.current);
    setIsCoachHovered(false);
    if (lifaHoverTimeoutRef.current) clearTimeout(lifaHoverTimeoutRef.current);
    setIsLifaHovered(true);
  };

  const handleLifaMouseLeave = () => {
    if (lifaHoverTimeoutRef.current) clearTimeout(lifaHoverTimeoutRef.current);
    lifaHoverTimeoutRef.current = setTimeout(() => {
      setIsLifaHovered(false);
    }, 120);
  };

  const handleCoachMouseEnter = () => {
    if (lifaHoverTimeoutRef.current) clearTimeout(lifaHoverTimeoutRef.current);
    setIsLifaHovered(false);
    if (coachHoverTimeoutRef.current) clearTimeout(coachHoverTimeoutRef.current);
    setIsCoachHovered(true);
  };

  const handleCoachMouseLeave = () => {
    if (coachHoverTimeoutRef.current) clearTimeout(coachHoverTimeoutRef.current);
    coachHoverTimeoutRef.current = setTimeout(() => {
      setIsCoachHovered(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (lifaHoverTimeoutRef.current) clearTimeout(lifaHoverTimeoutRef.current);
      if (coachHoverTimeoutRef.current) clearTimeout(coachHoverTimeoutRef.current);
    };
  }, []);

  // Stop arrow bouncing if drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      hasOpenedRef.current = true;
      setIsArrowBouncing(false);
    }
  }, [isDrawerOpen]);

  // Delay 15s after mount: if drawer has never been opened, start arrow bouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOpenedRef.current && !isDrawerOpen) {
        setIsArrowBouncing(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [isDrawerOpen]);

  return (
    <g
      id="slide-drawer-package"
      transform={`translate(${drawerShiftX}, 0)`}
      className="transition-all duration-500 ease-in-out"
      style={{
        filter:
          !isDrawerOpen && isDrawerHovered
            ? 'drop-shadow(-18px 12px 24px rgba(128, 128, 128, 0.35))'
            : 'drop-shadow(0px 0px 0px transparent)',
        transition: 'transform 0.5s ease-in-out, filter 0.3s ease-in-out',
      }}
      onMouseEnter={() => setIsDrawerHovered(true)}
      onMouseLeave={() => setIsDrawerHovered(false)}
    >
      {/* Drawer Shadow Filter path */}
      <g filter="url(#f)">
        <path
          fill="url(#g)"
          d="M75.092-108.02c0-11.375 4.715-19.275 20.21-19.079l862.437-.094v933.35c.04 16.678-2.744 23.061-22.374 23.049H95.741c-19.684.153-22.431-5.928-22.387-23.118s0-102.139 0-102.139c0-18.01-10.051-18.235-23.585-26.669l-30.218-16.341C1.208 648.993.043 641.733.043 611.739V75.845C.043 50 5.9 38.186 16.365 31.047c0 0 35.511-18.128 41.508-21.611C70.679 2 75.092.54 75.092-15.941Z"
          opacity={0.9}
          transform="translate(1847 228)"
        />
      </g>

      {/* Drawer Frame Outline (Clickable handle tab) */}
      <g
        fill="#f7f5f0"
        className="cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setIsDrawerOpen((prev) => !prev)}
      >
        <path d="M1913.442 902.104c-1.676 0-3.433-.405-5.223-1.205-7.374-3.294-31.117-16.284-32.154-16.852-4.814-3.137-8.077-5.71-10.576-8.34-2.602-2.737-4.391-5.59-5.632-8.977-1.196-3.266-1.942-7.22-2.348-12.44-.387-4.965-.466-11.02-.466-18.584V305.389c0-6.323.38-11.72 1.161-16.5.74-4.518 1.818-8.362 3.299-11.749 2.57-5.88 6.273-10.251 12.002-14.167l36.935-20.383.006-.003.005-.003c1.618-.92 3.195-1.386 4.687-1.386 1.594 0 3.037.564 4.063 1.586.989.986 1.534 2.325 1.535 3.77l.082 139.258.291 494.835.003 5.073.005 8.706c.002 2.295-.744 4.236-2.157 5.615-1.384 1.35-3.292 2.063-5.518 2.063Z" />
        <path
          fill="#fcfaf6"
          d="M1915.138 242.198c-1.317 0-2.727.422-4.193 1.255l-.022.012-36.893 20.36c-5.543 3.797-9.126 8.031-11.61 13.716-1.448 3.31-2.503 7.075-3.229 11.51-.772 4.726-1.148 10.07-1.148 16.338v530.317c0 7.54.079 13.573.463 18.506.399 5.127 1.127 8.996 2.29 12.174 1.192 3.254 2.913 5.997 5.418 8.633 2.438 2.565 5.636 5.086 10.365 8.17 1.428.781 24.776 13.548 32.047 16.797 1.661.742 3.282 1.118 4.816 1.118 1.96 0 3.626-.615 4.82-1.78 1.215-1.185 1.856-2.879 1.855-4.898l-.299-508.306-.082-139.565c0-1.178-.441-2.265-1.241-3.063-.85-.846-2.01-1.294-3.357-1.294m0-2c3.922 0 6.596 2.89 6.598 6.355l.373 634.093.008 13.779c.004 7.167-6.681 10.793-14.306 7.387-7.625-3.407-32.26-16.906-32.26-16.906-18.343-11.946-19.508-19.206-19.508-49.2V305.389c0-25.846 6.47-36.13 16.937-43.269l36.977-20.406c1.864-1.059 3.621-1.516 5.18-1.516Z"
        />
      </g>

      {/* Inner Drawer Card Rectangle */}
      <g
        fill="#f7f5f0"
        stroke="#fcfaf6"
        strokeWidth={2}
        transform="translate(1928 107)"
      >
        <rect width={870} height={943} stroke="none" rx={8} />
        <rect width={868} height={941} x={1} y={1} fill="none" rx={7} />
      </g>

      {/* INTERACTIVE TOGGLE ARROW BUTTON */}
      <g
        className={`cursor-pointer hover:opacity-75 transition-opacity ${
          isArrowBouncing && !isDrawerOpen ? 'animate-arrow-double-bounce' : ''
        }`}
        onClick={() => {
          hasOpenedRef.current = true;
          setIsArrowBouncing(false);
          setIsDrawerOpen((prev) => !prev);
        }}
      >
        <path
          d={
            isDrawerOpen
              ? "M1872 300h28M1892 293l8 7-8 7"
              : "M1872 300h28M1880 293l-8 7 8 7"
          }
          fill="none"
          stroke="#292727"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* CLIPPED DRAWER CONTENTS (Protected by drawerMaskClip) */}
      <g
        id="slide-drawer-contents-masked"
        clipPath="url(#drawerMaskClip)"
        style={{ clipPath: 'url(#drawerMaskClip)' }}
      >
        {/* UPPER DRAWER CONTENTS */}
        <g transform="translate(0 -23)">
          {/* Bio & Intro Column */}
          <foreignObject
            x={1980}
            y={245}
            width={380}
            height={506}
            className="overflow-hidden"
          >
            <div
              className="w-full h-full flex flex-col text-[#222020] pr-2 select-text antialiased overflow-hidden"
              style={{
                fontFamily: "GlowSansSC-Normal-Regular, 'Glow Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
              }}
            >
              {/* Fixed Main Title */}
              <div
                className="shrink-0 pb-4"
                onWheel={(e) => {
                  if (bioScrollRef.current) {
                    bioScrollRef.current.scrollTop += e.deltaY;
                  }
                }}
              >
                <h2 className="w-full text-[#1a1919] select-text">
                  <div className="flex items-baseline">
                    <span className="text-[50px] font-semibold text-black leading-none mr-0.5">嗨</span>
                    <span className="text-[24.5px] font-medium text-[#1a1919]">
                      ，这里是 <span className="text-black font-semibold">菌菌大魔王v</span>
                    </span>
                  </div>
                  <div className="text-[24.5px] font-medium text-[#1a1919] mt-1 tracking-[0.02em]">
                    的个人主页
                  </div>
                </h2>
              </div>

              {/* Scrollable Bio List */}
              <BioAutoScrollList ref={bioScrollRef} className="flex-1 min-h-0" />
            </div>
          </foreignObject>

          {/* WORKS COLUMN ("我的作品") */}
          <g transform="translate(2385 0)">
            <text
              fill="#292727"
              fontFamily="sans-serif"
              fontSize={28}
              fontWeight={500}
              transform="translate(0 247)"
            >
              <tspan x={0} y={32}>
                {"我的作品"}
              </tspan>
            </text>

            {/* Work 1: 理法 LIVEFOR with Hover Expand & Retract */}
            <g
              transform="translate(0 340)"
              className="group"
              onMouseEnter={handleLifaMouseEnter}
              onMouseLeave={handleLifaMouseLeave}
            >
              {/* Header Row: Clickable to select project */}
              <g
                className="cursor-pointer"
                onClick={() => onSelectProject(PROJECTS_DATA[0])}
              >
                <rect
                  x={-8}
                  y={-8}
                  width={340}
                  height={68}
                  fill="transparent"
                  pointerEvents="all"
                />
                <image
                  xlinkHref="/pc_logo.png"
                  href="/pc_logo.png"
                  width={34}
                  height={34}
                  x={0}
                  y={-4}
                />
                <text
                  fontFamily="sans-serif"
                  fontSize={22}
                  fontWeight={600}
                  x={44}
                  y={20}
                >
                  <tspan fill="#292727">理法</tspan>
                  <tspan fill="#292727">LIVE</tspan>
                  <tspan fill="#b70f00">F</tspan>
                  <tspan fill="#292727">OR</tspan>
                </text>
                <text
                  fill="#777373"
                  fontFamily="sans-serif"
                  fontSize={15}
                  x={0}
                  y={52}
                >
                  UX&UI设计 + 官网搭建
                </text>

                <path
                  fill="none"
                  stroke="#a5a195"
                  strokeWidth={1}
                  d="M185 20h80"
                  className="group-hover:stroke-black transition-colors"
                />

                <g transform="translate(275 12)">
                  <path
                    fill="#292727"
                    d="M0 2l8 5-8 5Z"
                    className="group-hover:fill-black transition-colors"
                  />
                  <text
                    fill="#292727"
                    fontFamily="sans-serif"
                    fontSize={16}
                    x={16}
                    y={10}
                    className="group-hover:fill-black transition-colors"
                  >
                    浏览
                  </text>
                </g>
              </g>

              {/* Animated Expanding/Retracting Demo Video Window */}
              <AnimatePresence>
                {isLifaHovered && (
                  <foreignObject
                    x={-4}
                    y={62}
                    width={348}
                    height={215}
                    className="overflow-hidden"
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="relative w-full pt-0.5">
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{
                          scaleX: 1,
                          opacity: 1,
                          transition: {
                            duration: 0.28,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        exit={{
                          scaleX: 0,
                          opacity: 0,
                          transition: {
                            duration: 0.2,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        className="w-full h-[2.5px] bg-neutral-900 border border-neutral-700/60 rounded-full shadow-sm origin-center z-20 relative"
                      />

                      <div className="overflow-hidden mt-1.5 px-0.5">
                        <motion.div
                          initial={{ y: "-100%", opacity: 0 }}
                          animate={{
                            y: "0%",
                            opacity: 1,
                            transition: {
                              duration: 0.3,
                              delay: 0.04,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          }}
                          exit={{
                            y: "-100%",
                            opacity: 0,
                            transition: {
                              duration: 0.22,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          }}
                          className="relative w-full rounded-xl overflow-hidden bg-black aspect-video shadow-xl border border-[#dfdad0] group/video"
                        >
                          <video
                            src="/demo_video.mp4"
                            poster="/demo_video_poster.jpg"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="auto"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded text-[11px] text-white/95 font-medium flex items-center gap-1.5 pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            演示视频 · DEMO
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(PROJECTS_DATA[0]);
                            }}
                            className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 hover:bg-black backdrop-blur-md rounded-md text-[11px] text-white font-medium flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          >
                            <span>全屏浏览</span>
                            <span>↗</span>
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </foreignObject>
                )}
              </AnimatePresence>
            </g>

            {/* Work 2: Coach */}
            <g
              transform={`translate(0 ${isLifaHovered ? 640 : 425})`}
              style={{
                transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="group"
              onMouseEnter={handleCoachMouseEnter}
              onMouseLeave={handleCoachMouseLeave}
            >
              <g
                className="cursor-pointer"
                onClick={() => onSelectProject(PROJECTS_DATA[1])}
              >
                <rect
                  x={-8}
                  y={-8}
                  width={340}
                  height={68}
                  fill="transparent"
                  pointerEvents="all"
                />

                <image
                  xlinkHref="/rotor_logo.png"
                  href="/rotor_logo.png"
                  width={24}
                  height={24}
                  x={5}
                  y={1}
                  preserveAspectRatio="xMidYMid meet"
                />

                <text
                  fill="#292727"
                  fontFamily="sans-serif"
                  fontSize={22}
                  fontWeight={600}
                  x={44}
                  y={20}
                >
                  Coach
                </text>
                <text
                  fill="#777373"
                  fontFamily="sans-serif"
                  fontSize={15}
                  x={0}
                  y={52}
                >
                  UX&UI设计 + 官网搭建
                </text>

                <path
                  fill="none"
                  stroke="#a5a195"
                  strokeWidth={1}
                  d="M125 20h140"
                  className="group-hover:stroke-black transition-colors"
                />

                <g transform="translate(275 12)">
                  <path
                    fill="#292727"
                    d="M0 2l8 5-8 5Z"
                    className="group-hover:fill-black transition-colors"
                  />
                  <text
                    fill="#292727"
                    fontFamily="sans-serif"
                    fontSize={16}
                    x={16}
                    y={10}
                    className="group-hover:fill-black transition-colors"
                  >
                    浏览
                  </text>
                </g>
              </g>

              <AnimatePresence>
                {isCoachHovered && (
                  <foreignObject
                    x={-4}
                    y={62}
                    width={348}
                    height={215}
                    className="overflow-hidden"
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="relative w-full pt-0.5">
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{
                          scaleX: 1,
                          opacity: 1,
                          transition: {
                            duration: 0.28,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        exit={{
                          scaleX: 0,
                          opacity: 0,
                          transition: {
                            duration: 0.2,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }}
                        className="w-full h-[2.5px] bg-neutral-900 border border-neutral-700/60 rounded-full shadow-sm origin-center z-20 relative"
                      />

                      <div className="overflow-hidden mt-1.5 px-0.5">
                        <motion.div
                          initial={{ y: "-100%", opacity: 0 }}
                          animate={{
                            y: "0%",
                            opacity: 1,
                            transition: {
                              duration: 0.3,
                              delay: 0.04,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          }}
                          exit={{
                            y: "-100%",
                            opacity: 0,
                            transition: {
                              duration: 0.22,
                              ease: [0.16, 1, 0.3, 1],
                            },
                          }}
                          className="relative w-full rounded-xl overflow-hidden bg-black aspect-video shadow-xl border border-[#dfdad0] group/mosaic flex items-center justify-center"
                        >
                          <RealCalculatedMosaic
                            width={340}
                            height={192}
                            blockSize={12}
                            imageSrc="/coach_preview.jpg"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded text-[11px] text-white/95 font-medium flex items-center gap-1.5 pointer-events-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            设计海报 · COACH
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(PROJECTS_DATA[1]);
                            }}
                            className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 hover:bg-black backdrop-blur-md rounded-md text-[11px] text-white font-medium flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                          >
                            <span>全屏浏览</span>
                            <span>↗</span>
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </foreignObject>
                )}
              </AnimatePresence>
            </g>

            {/* Work 3: srcreat 拉美西斯 - 筹划中 */}
            <g
              transform={`translate(0 ${(isLifaHovered || isCoachHovered) ? 740 : 525})`}
              style={{
                transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="cursor-pointer group"
              onClick={() => onSelectProject(PROJECTS_DATA[2])}
            >
              <text fill="#292727" fontFamily="sans-serif" fontSize={22} fontWeight={600} x={0} y={20}>
                srcreat
              </text>
              <g transform="translate(85 2)">
                <text fill="#292727" fontFamily="sans-serif" fontSize={15} fontWeight={500} x={8} y={16}>
                  拉美西斯
                </text>
              </g>
              <g transform="translate(0 34)">
                <text fill="#777373" fontFamily="sans-serif" fontSize={15} x={0} y={15}>
                  UX&UI设计 + 官网搭建
                </text>
              </g>
              <path fill="none" stroke="#c0bcaf" strokeWidth={1} d="M180 20h85" />
              <g transform="translate(275 12)">
                <path fill="#414141" d="M4 0l4 3-2 6H2L0 3Z" />
                <text fill="#414141" fontFamily="sans-serif" fontSize={16} x={14} y={10}>
                  筹划中
                </text>
              </g>

              {/* Real Calculated Mosaic Overlay */}
              <foreignObject x={-6} y={-2} width={345} height={58}>
                <RealCalculatedMosaic width={345} height={58} blockSize={6} />
              </foreignObject>
            </g>

            {/* Section: 我的武器库 */}
            <g
              transform={`translate(0 ${(isLifaHovered || isCoachHovered) ? 820 : 605})`}
              style={{
                transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <text
                fill="#292727"
                fontFamily="sans-serif"
                fontSize={22}
                fontWeight={600}
                x={0}
                y={20}
              >
                我的武器库
              </text>
              <text
                fill="#8c867c"
                fontFamily="sans-serif"
                fontSize={15}
                x={122}
                y={20}
              >
                ARSENAL · 软件与技能
              </text>

              <line
                x1={0}
                y1={29}
                x2={348}
                y2={29}
                stroke="#eae5da"
                strokeWidth={1}
              />

              <foreignObject
                x={-4}
                y={34}
                width={356}
                height={(isLifaHovered || isCoachHovered) ? 219 : 434}
                className="overflow-hidden"
                style={{
                  overflow: 'hidden',
                  transition: 'height 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar pr-0.5">
                  <ArsenalStorageBox />
                </div>
              </foreignObject>
            </g>
          </g>
        </g>

        {/* WeChat Button */}
        <g
          transform="translate(1982.891 830)"
          className="cursor-pointer group"
          onClick={() => onOpenContact('wechat')}
        >
          <path
            fill="#292727"
            className="group-hover:fill-black transition-colors"
            d="M0 2.5l11 6.5L0 15.5Z"
          />
          <text
            fill="#292727"
            className="group-hover:fill-black transition-colors"
            fontFamily="sans-serif"
            fontSize={18}
            fontWeight={500}
            x={22}
            y={15}
          >
            微信 WeChat
          </text>
        </g>

        {/* Phone Button */}
        <g
          transform="translate(1982.891 868)"
          className="cursor-pointer group"
          onClick={() => onOpenContact('phone')}
        >
          <path
            fill="#292727"
            className="group-hover:fill-black transition-colors"
            d="M0 2.5l11 6.5L0 15.5Z"
          />
          <text
            fill="#292727"
            className="group-hover:fill-black transition-colors"
            fontFamily="sans-serif"
            fontSize={18}
            fontWeight={500}
            x={22}
            y={15}
          >
            电话 Phone
          </text>
        </g>
      </g>
    </g>
  );
};
