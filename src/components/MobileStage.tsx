import React, { useState, useRef, useEffect } from 'react';
import { ProjectItem, ContactType } from '../types';
import { MOBILE_STAGE } from '../constants/layout';
import { useParallax } from '../hooks/useParallax';
import { MobileHeader } from './mobile/MobileHeader';
import { MobileHeroFrame } from './mobile/MobileHeroFrame';
import { MobileDrawerSheet } from './mobile/MobileDrawerSheet';

interface MobileStageProps {
  onSelectProject: (project: ProjectItem) => void;
  onOpenContact: (type: ContactType) => void;
}

export const MobileStage: React.FC<MobileStageProps> = ({
  onSelectProject,
  onOpenContact,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(MOBILE_STAGE.DEFAULT_WIDTH);
  const [stageHeight, setStageHeight] = useState(MOBILE_STAGE.DEFAULT_HEIGHT);

  // Parallax physics with gyroscope + touchmove fallback
  const { renderPos } = useParallax({ damping: 0.13, enableGyroscope: true });

  // Responsive stage sizing
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        setStageWidth(stageRef.current.clientWidth);
        setStageHeight(stageRef.current.clientHeight || window.innerHeight || MOBILE_STAGE.DEFAULT_HEIGHT);
      } else if (typeof window !== 'undefined') {
        setStageWidth(Math.min(window.innerWidth, MOBILE_STAGE.MAX_WIDTH));
        setStageHeight(window.innerHeight || MOBILE_STAGE.DEFAULT_HEIGHT);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    window.visualViewport?.addEventListener('resize', updateSize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      ro = new ResizeObserver(() => updateSize());
      ro.observe(stageRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      window.visualViewport?.removeEventListener('resize', updateSize);
      ro?.disconnect();
    };
  }, []);

  // Strict dynamic drawer layout calculations
  const drawerWidth = Math.max(stageWidth - 10, 280);
  const scale = drawerWidth / MOBILE_STAGE.DESIGN_W;
  const drawerHeight = drawerWidth * (MOBILE_STAGE.DESIGN_H / MOBILE_STAGE.DESIGN_W);
  const peekHeight = MOBILE_STAGE.PEEK_HANDLE_HEIGHT * scale;
  const maxAllowedOffset = Math.max(stageHeight - 64 - peekHeight, 200);
  const openOffset = Math.min(drawerHeight - peekHeight, maxAllowedOffset);
  const marginBottom = -(drawerHeight - peekHeight);

  return (
    <div
      id="mobile-stage-root"
      className="w-full min-h-[100dvh] bg-[#eae8e4] text-[#292727] flex flex-col items-center justify-start relative overflow-hidden select-none no-scrollbar touch-pan-y"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        ref={stageRef}
        className="w-full max-w-[430px] relative flex flex-col items-center min-h-[100dvh] justify-between overflow-visible"
      >
        {/* Top Fixed Header */}
        <MobileHeader onLogoClick={() => setIsDrawerOpen(false)} />

        {/* Dynamic Responsive Scaled Photo Canvas */}
        <MobileHeroFrame renderPos={renderPos} />

        {/* Bottom Drawer Sheet */}
        <MobileDrawerSheet
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          drawerWidth={drawerWidth}
          drawerHeight={drawerHeight}
          openOffset={openOffset}
          marginBottom={marginBottom}
          scale={scale}
          onSelectProject={onSelectProject}
          onOpenContact={onOpenContact}
        />
      </div>
    </div>
  );
};
