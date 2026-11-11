import React, { useState } from 'react';
import { SvgCanvas } from './components/SvgCanvas';
import { MobileStage } from './components/MobileStage';
import { ProjectModal } from './components/ProjectModal';
import { ContactModal } from './components/ContactModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { Preloader } from './components/Preloader';
import { ProjectItem, ContactType } from './types';
import { useIsMobile } from './hooks/useIsMobile';
import { useAssetPreload } from './hooks/useAssetPreload';
import { PC_CORE_ASSETS, MOBILE_CORE_ASSETS } from './constants/assets';

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [contactType, setContactType] = useState<ContactType | null>(null);

  // Responsive device orientation / aspect ratio detection
  const isMobile = useIsMobile();

  // 100% genuine byte-accurate network preload & GPU texture decoding
  const { isLoading, progress, loadedMB, totalMB } = useAssetPreload({
    assets: isMobile ? MOBILE_CORE_ASSETS : PC_CORE_ASSETS,
  });

  return (
    <div className="fixed inset-0 w-full h-full h-[100dvh] bg-[#eae8e4] text-neutral-900 font-sans overflow-hidden select-none flex flex-col justify-center items-center overscroll-none">
      {/* Real Network Download & GPU Texture Preloader */}
      <Preloader
        isLoading={isLoading}
        progress={progress}
        loadedMB={loadedMB}
        totalMB={totalMB}
      />

      {/* Dynamic Viewport: Mobile Custom Layout vs Desktop 1:1 Vector Stage */}
      {isMobile ? (
        <MobileStage
          onSelectProject={(proj) => setSelectedProject(proj)}
          onOpenContact={(type) => setContactType(type)}
          isLoading={isLoading}
        />
      ) : (
        <main className="w-full h-screen h-[100dvh] flex items-center justify-center relative overflow-hidden bg-[#eae8e4]">
          <SvgCanvas
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onOpenContact={(type) => setContactType(type)}
          />
        </main>
      )}

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Contact QR & Phone Modal */}
      <ContactModal
        type={contactType}
        onClose={() => setContactType(null)}
      />

      {/* 3D Aerodynamic Physics Confetti Canvas */}
      <ConfettiCanvas />
    </div>
  );
}
