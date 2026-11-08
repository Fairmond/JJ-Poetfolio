import React, { useState, useCallback } from 'react';
import { motion, useDragControls } from 'motion/react';
import { ProjectItem, ContactType } from '../../types';
import { PROJECTS_DATA } from '../../data/projectsData';
import { RealCalculatedMosaic } from '../RealCalculatedMosaic';
import { SafeImage } from '../SafeImage';
import { ArsenalStorageBox } from '../ArsenalStorageBox';

interface MobileDrawerSheetProps {
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  drawerWidth: number;
  drawerHeight: number;
  openOffset: number;
  marginBottom: number;
  scale: number;
  onSelectProject: (project: ProjectItem) => void;
  onOpenContact: (type: ContactType) => void;
}

export const MobileDrawerSheet: React.FC<MobileDrawerSheetProps> = ({
  isDrawerOpen,
  setIsDrawerOpen,
  drawerWidth,
  drawerHeight,
  openOffset,
  marginBottom,
  scale,
  onSelectProject,
  onOpenContact,
}) => {
  const [isPsRevealed, setIsPsRevealed] = useState(false);
  const dragControls = useDragControls();

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  // Sampled procedural canvas drawing for srcreat mobile card
  const drawMobileSrcreatContent = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#fdfcf9';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#292727';
    ctx.font = '500 15px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('srcreat 拉美西斯', 14, 14);

    ctx.strokeStyle = '#f0ede6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 43);
    ctx.lineTo(w, 43);
    ctx.stroke();

    ctx.fillStyle = '#7a7474';
    ctx.font = '11px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
    ctx.fillText('UX&UI · AI Agent 智能助手', 14, 48);
  }, []);

  return (
    <motion.div
      id="mobile-bottom-sheet"
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: -openOffset, bottom: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40 || info.velocity.y < -250) {
          setIsDrawerOpen(true);
        } else if (info.offset.y > 40 || info.velocity.y > 250) {
          setIsDrawerOpen(false);
        }
      }}
      animate={{
        y: isDrawerOpen ? -openOffset : 0,
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 280,
      }}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 select-none"
      style={{
        width: `${drawerWidth}px`,
        height: `${drawerHeight}px`,
        marginBottom: `${marginBottom}px`,
      }}
    >
      {/* Exact SVGR Graphic Background */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 407.521 647.218"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient
            id="drawer_radial_bg"
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
            id="drawer_drop_filter"
            width={407.521}
            height={647.218}
            x={0}
            y={0}
            filterUnits="userSpaceOnUse"
          >
            <feOffset dy={3} />
            <feGaussianBlur result="blur" stdDeviation={4} />
            <feFlood floodOpacity={0.149} />
            <feComposite in2="blur" operator="in" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>

        {/* 1. 3D Volume Shadow base */}
        <g filter="url(#drawer_drop_filter)" transform="translate(-.003 -.001)">
          <path
            fill="url(#drawer_radial_bg)"
            d="M40.531-127.225h560.036c7.572 0 12.542 3.842 12.542 12.352l-.021 5.593-1.269 341.593-.029 7.919c0 10.586-4.912 16.044-14.564 16.052-.079 0-.459.013-.846.013H42.476a13.1 13.1 0 0 1-13.032-12.873c.007-7.356-.006-19.115-.006-19.115 0-7.222-4.03-7.312-9.457-10.694L-2.287 202.3c-7.355-4.79-7.822-7.7-7.822-19.728V-58.147c0-10.363 2.348-15.1 6.545-17.963 0 0 24.391-10.013 26.8-11.409 5.135-2.981 6.9-4.169 6.9-10.777V-117.2c-.001-6.419 5.128-9.974 10.395-10.025Z"
            data-name="体积"
            opacity={0.9}
            transform="rotate(90 124.595 143.705)"
          />
        </g>

        {/* 2. Top handle tab */}
        <g fill="#f7f5f0">
          <path d="M61.654 41.777c0-.59.143-1.216.423-1.858 1.274-2.915 8.157-16.972 8.626-17.93 2.325-3.64 4.082-5.329 6.472-6.223 2.708-1.014 6.491-1.09 11.954-1.09H323.52c4.675 0 8.217.568 10.83 1.735 2.175.972 3.8 2.373 5.26 4.536l8.488 19.826.02.047.025.045c.311.56.47 1.095.47 1.591 0 .953-.629 1.645-1.494 1.646h-1.083c-15.225.004-72.653.027-276.573.15H68.14l-4.083.003c-.728 0-1.337-.234-1.76-.677-.42-.441-.644-1.064-.644-1.801Z" />
          <path
            fill="#fcfaf6"
            d="M347.612 42.456c0-.223-.06-.596-.343-1.105l-.05-.09-8.491-19.832c-1.335-1.955-2.817-3.225-4.786-4.105-2.482-1.109-5.89-1.648-10.422-1.648H89.13c-5.19 0-9.059.074-11.603 1.026-2.18.816-3.744 2.332-5.95 5.778-.645 1.318-7.335 14.987-8.582 17.84-.222.507-.34 1.011-.34 1.457 0 .468.13.863.368 1.11.233.245.581.368 1.035.368l5.405-.003c203.92-.123 261.348-.146 276.573-.15h1.083c.31 0 .494-.242.494-.646m2 0c0 1.573-1.133 2.645-2.493 2.646-1.871.001-32.155.002-277.656.15-1.904 0-2.593.001-5.404.003-2.812.002-4.234-2.68-2.898-5.737 1.336-3.057 8.669-18.02 8.669-18.02 4.686-7.355 7.533-7.822 19.299-7.822H323.52c10.138 0 14.172 2.595 16.972 6.791l8.526 19.912c.415.747.594 1.452.594 2.077Z"
          />
        </g>

        {/* 3. Double border frame */}
        <g fill="#f7f5f0" data-name="路径 259">
          <path d="M16.89 619.549V60.614c0-3.86 3.14-7 7-7h360.116c3.86 0 7 3.14 7 7v558.935c0 1.744-1.132 3.769-3.03 5.417-1.855 1.612-4.166 2.613-6.03 2.613l-358.053-1.03c-3.863 0-7.003-3.14-7.003-7Z" />
          <path
            fill="#fcfaf6"
            d="M390.006 60.614c0-3.308-2.692-6-6-6H23.89c-3.309 0-6 2.692-6 6v558.935c0 3.308 2.691 6 6 6h.006l358.054 1.03c1.633-.001 3.691-.908 5.37-2.368 1.682-1.46 2.686-3.204 2.686-4.662V60.614m2 0v558.935c0 4.418-5.642 9.03-10.06 9.03L23.89 627.55a8 8 0 0 1-8-8V60.614a8 8 0 0 1 8-8h360.116a8 8 0 0 1 8 8Z"
          />
        </g>
      </svg>

      {/* Interactive Trigger Overlay Tab */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        onClick={toggleDrawer}
        className="absolute left-1/2 -translate-x-1/2 top-[2.2%] w-[70%] z-30 cursor-grab active:cursor-grabbing flex items-center justify-between px-5 sm:px-6 focus:outline-none touch-none"
        style={{ height: `${32 * scale}px` }}
      >
        <div className="relative z-10 flex items-baseline gap-2 pt-0.5 pointer-events-none">
          <span className="text-[15px] font-bold text-[#292727] tracking-tight">
            关于我
          </span>
          <span className="text-[13px] text-[#292727] font-light font-sans opacity-90">
            About me
          </span>
        </div>

        <motion.div
          animate={{ rotate: isDrawerOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex items-center justify-center text-[#292727] pt-0.5 pointer-events-none"
        >
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="#292727" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="13" x2="6" y2="1" />
            <polyline points="1.5 5.5 6 1 10.5 5.5" />
          </svg>
        </motion.div>
      </div>

      {/* Scrollable Content Container */}
      <div
        className="absolute left-[6.2%] right-[6.2%] top-[9.5%] px-3.5 pt-4 pb-20 flex flex-col gap-5 overflow-y-auto overflow-x-hidden no-scrollbar touch-pan-y overscroll-contain z-20 box-border select-text"
        style={{
          bottom: `${Math.max(marginBottom < 0 ? -marginBottom * 0.1 : 24, 20)}px`,
          maxHeight: `${openOffset - 40}px`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Bio & Vision Section */}
        <div className="w-full min-w-0 flex flex-col gap-3 break-words">
          <h2 className="w-full text-[#1a1919] select-text">
            <div className="flex items-baseline">
              <span className="text-[34px] min-[375px]:text-[36px] font-semibold text-black leading-none mr-0.5 shrink-0">嗨</span>
              <span className="text-[17px] min-[375px]:text-[18px] font-medium text-[#1a1919]">
                ，这里是 <span className="font-semibold text-black">菌菌大魔王v</span>
              </span>
            </div>
            <div className="text-[17px] min-[375px]:text-[18px] font-medium text-[#1a1919] mt-0.5">
              的个人主页
            </div>
          </h2>

          <p className="text-[14px] sm:text-[15px] font-normal leading-[1.65] text-[#222020] break-words">
            目前你可以在这里看到一些我从一个idea，设计并搭建（主页）的项目，他们或许现在只是一张图纸，但在未来的某一天一定会真实落地。
          </p>

          <p className="text-[14px] sm:text-[15px] font-normal leading-[1.65] text-[#222020] break-words">
            近期我正在深度学习和使用agent，尝试把agent结合到工作中，打造一套成熟高效的的agent工作流。
          </p>

          <p className="text-[14px] sm:text-[15px] font-normal leading-[1.65] text-[#222020] break-words">
            终极理想是可以做出乔布斯口中’站在人文与科技的十字路口‘的顶级东西。
          </p>

          <p className="text-[14px] sm:text-[15px] font-normal leading-[1.65] text-[#222020] break-words">
            接下来的三年时间，我将努力去成为可以推动一个想法完整落地的负责人。
          </p>

          <p className="text-[14px] sm:text-[15px] font-normal leading-[1.65] text-[#222020] break-words">
            最好能找到一群有共同目标的人，多挣点钱😜。
          </p>

          <p className="text-[14px] sm:text-[15px] font-semibold leading-[1.65] text-[#141414] break-words">
            如果有幸同行，请多多关照
          </p>

          <p className="text-[13px] sm:text-[13.5px] leading-[1.6] text-[#555050] break-words group select-text">
            <span className="font-medium mr-1.5 text-[#555050]">ps.</span>
            <span
              onClick={() => setIsPsRevealed(prev => !prev)}
              className={`inline bg-black ${isPsRevealed ? 'text-white' : 'text-black'} group-hover:text-white hover:text-white active:text-white px-1.5 py-0.5 rounded-[3px] transition-colors duration-200 cursor-pointer box-decoration-clone select-text selection:bg-white selection:text-black`}
              title="点击或悬停刮开查看"
            >
              如果有足球、吉他、健身的同好也期待深度交流。
            </span>
          </p>
        </div>

        {/* Contact Actions */}
        <div className="w-full min-w-0 flex flex-col gap-2 pt-2 border-t border-[#ebe7de]">
          <button
            id="mobile-contact-wechat"
            type="button"
            onClick={() => onOpenContact('wechat')}
            className="flex items-center gap-2.5 text-[14.5px] sm:text-[15px] text-[#292727] font-medium hover:text-black active:scale-[0.98] transition-all w-fit max-w-full truncate cursor-pointer py-1"
          >
            <span className="text-[11px] text-[#292727] transform scale-y-110 shrink-0">▶</span>
            <span className="truncate">微信 WeChat</span>
          </button>

          <button
            id="mobile-contact-phone"
            type="button"
            onClick={() => onOpenContact('phone')}
            className="flex items-center gap-2.5 text-[14.5px] sm:text-[15px] text-[#292727] font-medium hover:text-black active:scale-[0.98] transition-all w-fit max-w-full truncate cursor-pointer py-1"
          >
            <span className="text-[11px] text-[#292727] transform scale-y-110 shrink-0">▶</span>
            <span className="truncate">电话 Phone</span>
          </button>
        </div>

        {/* Section: 我的作品 */}
        <div className="w-full min-w-0 flex flex-col gap-3 pt-2 border-t border-[#ebe7de]">
          <div className="w-full min-w-0 flex items-center justify-between">
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#292727]">
              我的作品
            </h3>
            <span className="text-[12px] text-[#8e8989] shrink-0">Projects</span>
          </div>

          {/* Project 1: 理法 LIVEFOR */}
          <div
            id="mobile-project-lifa"
            onClick={() => onSelectProject(PROJECTS_DATA[0])}
            className="w-full max-w-full min-w-0 box-border bg-[#fdfcf9] rounded-xl p-3 sm:p-3.5 border border-[#e8e4db] shadow-sm hover:border-[#c9c4b8] active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="w-full min-w-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <SafeImage
                  src="/logo_black_red.png"
                  alt="理法 LIVEFOR"
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0"
                />
                <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                  <span className="text-[14px] sm:text-[15px] font-bold text-[#292727]">理法</span>
                  <span className="text-[14px] sm:text-[15px] font-bold text-[#292727] tracking-wider truncate">
                    LIVE<span className="text-[#b70f00]">F</span>OR
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://livefor.2371402599.workers.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-0.5 bg-neutral-900 hover:bg-black text-white rounded text-[11px] font-medium flex items-center transition-all shadow-xs cursor-pointer active:scale-95 no-underline z-10"
                >
                  官网入口
                </a>
                <div className="flex items-center gap-1 text-[12px] text-[#666161] font-medium">
                  <span>详情</span>
                  <span className="text-[10px]">►</span>
                </div>
              </div>
            </div>

            <div className="w-full min-w-0 flex items-center justify-between gap-2 text-[11px] text-[#7a7474] pt-0.5 border-t border-[#f0ede6]">
              <span className="truncate">UX&amp;UI设计 + 官网搭建</span>
              <span className="text-[#a19c9c] shrink-0">Web · Experience</span>
            </div>

            <div className="w-full mt-1 rounded-lg overflow-hidden bg-black/90 aspect-video relative border border-neutral-200/60 shadow-inner">
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
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] text-white/90 font-medium">
                演示视频
              </div>
            </div>
          </div>

          {/* Project 2: Coach */}
          <div
            id="mobile-project-coach"
            onClick={() => onSelectProject(PROJECTS_DATA[1])}
            className="w-full max-w-full min-w-0 box-border bg-[#fdfcf9] rounded-xl p-3 sm:p-3.5 border border-[#e8e4db] shadow-sm hover:border-[#c9c4b8] active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="w-full min-w-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <SafeImage
                  src="/rotor_logo.png"
                  alt="Coach logo"
                  className="w-5 h-5 sm:w-[22px] sm:h-[22px] object-contain shrink-0"
                />
                <span className="text-[14px] sm:text-[15px] font-bold text-[#292727] tracking-wide truncate">Coach</span>
              </div>

              <div className="flex items-center gap-1 text-[12px] text-[#666161] font-medium shrink-0">
                <span>浏览</span>
                <span className="text-[10px]">►</span>
              </div>
            </div>

            <div className="w-full min-w-0 flex items-center justify-between gap-2 text-[11px] text-[#7a7474] pt-0.5 border-t border-[#f0ede6]">
              <span className="truncate">UX&amp;UI设计 + 官网搭建</span>
              <span className="text-[#a19c9c] shrink-0">Design System · App</span>
            </div>
          </div>

          {/* Project 3: srcreat 拉美西斯 */}
          <div
            id="mobile-project-srcreat"
            className="w-full max-w-full min-w-0 box-border bg-[#fdfcf9] rounded-xl p-3 sm:p-3.5 border border-[#e8e4db] shadow-sm flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="w-full min-w-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <span className="text-[14px] sm:text-[15px] font-medium text-[#292727] truncate">srcreat 拉美西斯</span>
              </div>

              <span className="text-[10px] sm:text-[11px] text-[#9c9696] bg-[#eae6dc] px-2 py-0.5 rounded-full font-medium shrink-0">
                ☕ 筹划中
              </span>
            </div>

            <div className="w-full min-w-0 flex items-center justify-between gap-2 text-[11px] text-[#7a7474] pt-0.5 border-t border-[#f0ede6]">
              <span className="truncate">UX&amp;UI · AI Agent 智能助手</span>
              <span className="text-[#a19c9c] shrink-0">Planning</span>
            </div>

            <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden pointer-events-none rounded-l-xl z-20">
              <RealCalculatedMosaic
                width={200}
                height={75}
                blockSize={6}
                drawContent={drawMobileSrcreatContent}
                style={{ width: '100%', height: '100%' }}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section: 我的武器库 */}
        <div className="w-full min-w-0 flex flex-col gap-2.5 pt-3 border-t border-[#ebe7de]">
          <div className="w-full min-w-0 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[#292727]">
                我的武器库
              </h3>
              <span className="text-[13px] text-[#777373]">ARSENAL · 软件与技能</span>
            </div>
          </div>

          <ArsenalStorageBox />
        </div>
      </div>

      {/* Seamless downward extension ensuring no gaps or edges at the bottom */}
      <div className="absolute top-[99.5%] left-0 right-0 h-[400px] bg-[#f7f5f0] pointer-events-none" />
    </motion.div>
  );
};
