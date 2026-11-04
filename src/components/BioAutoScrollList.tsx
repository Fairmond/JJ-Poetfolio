import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';

interface BioAutoScrollListProps {
  className?: string;
}

export const BioAutoScrollList = forwardRef<HTMLDivElement, BioAutoScrollListProps>(
  ({ className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const firstSetRef = useRef<HTMLDivElement>(null);

    // Easter egg state
    const [isPsRevealed, setIsPsRevealed] = useState(false);

    // Animation & User activity tracking refs
    const isHoveredRef = useRef(false);
    const userActiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Expose DOM element to parent via ref
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Pause auto-scroll briefly during and after user wheel/scroll interaction
    const markUserActive = useCallback((cooldownMs = 2200) => {
      if (userActiveTimeoutRef.current) {
        clearTimeout(userActiveTimeoutRef.current);
      }
      userActiveTimeoutRef.current = setTimeout(() => {
        userActiveTimeoutRef.current = null;
      }, cooldownMs);
    }, []);

    const handleWheel = () => {
      markUserActive(2200);
    };

    // Auto-scroll loop via requestAnimationFrame
    useEffect(() => {
      let animId: number;
      let lastTime = performance.now();
      const speed = 25; // pixels per second: gentle, readable, ambient

      const loop = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        const el = containerRef.current;
        const firstSet = firstSetRef.current;

        if (el && firstSet) {
          const singleHeight = firstSet.offsetHeight;

          // Infinite loop boundary check
          if (singleHeight > 0) {
            if (el.scrollTop >= singleHeight) {
              el.scrollTop -= singleHeight;
            } else if (el.scrollTop < 0) {
              el.scrollTop += singleHeight;
            }
          }

          // Advance auto-scroll when user is not hovering or actively wheeling
          const isUserActive =
            isHoveredRef.current || userActiveTimeoutRef.current !== null;

          if (!isUserActive && singleHeight > 0) {
            el.scrollTop += speed * dt;
          }
        }

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(animId);
        if (userActiveTimeoutRef.current) {
          clearTimeout(userActiveTimeoutRef.current);
        }
      };
    }, []);

    // Render one set of paragraphs
    const renderParagraphSet = (isClone = false) => (
      <div
        ref={isClone ? undefined : firstSetRef}
        aria-hidden={isClone}
        className="flex flex-col gap-3.5 pr-1 select-text"
      >
        <p className="text-[22px] font-normal leading-[1.5] text-[#222020] mb-4">
          目前你可以在这里看到一些我从一个idea，设计并搭建（主页）的项目，他们或许现在只是一张图纸，但在未来的某一天一定会真实落地。
        </p>

        <p className="text-[22px] font-normal leading-[1.5] text-[#222020]">
          近期我正在深度学习和使用agent，尝试把agent结合到工作中，打造一套成熟高效的的agent工作流。
        </p>

        <p className="text-[22px] font-normal leading-[1.5] text-[#222020]">
          终极理想是可以做出乔布斯口中’站在人文与科技的十字路口‘的顶级东西。
        </p>

        <p className="text-[22px] font-normal leading-[1.5] text-[#222020]">
          接下来的三年时间，我将努力去成为可以推动一个想法完整落地的负责人。
        </p>

        <p className="text-[22px] font-normal leading-[1.5] text-[#222020]">
          最好能找到一群有共同目标的人，多挣点钱😜。
        </p>

        <p className="text-[22px] font-semibold leading-[1.5] text-[#141414]">
          如果有幸同行，请多多关照
        </p>

        <p className="text-[18.5px] leading-[1.65] text-[#555050] select-text group pb-2">
          <span className="font-medium mr-1.5 text-[#555050]">ps.</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setIsPsRevealed((prev) => !prev);
            }}
            className={`inline bg-black ${
              isPsRevealed ? 'text-white' : 'text-black'
            } group-hover:text-white hover:text-white active:text-white px-1.5 py-0.5 rounded-[3px] transition-colors duration-200 cursor-pointer box-decoration-clone select-text selection:bg-white selection:text-black`}
            title="悬停或点击刮开查看"
          >
            如果有足球、吉他、健身的同好也期待深度交流。
          </span>
        </p>

        {/* Seamless Loop Separator (间歇留白与呼吸感节点) */}
        <div className="py-6 flex items-center justify-center gap-2 opacity-35 select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c867c]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c867c]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c867c]" />
        </div>
      </div>
    );

    return (
      <div
        ref={containerRef}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
        onWheel={handleWheel}
        className={`w-full overflow-y-auto no-scrollbar overscroll-contain select-text ${className}`}
      >
        {/* Set 1: Primary content */}
        {renderParagraphSet(false)}

        {/* Set 2: Seamless loop clone */}
        {renderParagraphSet(true)}
      </div>
    );
  }
);

BioAutoScrollList.displayName = 'BioAutoScrollList';
