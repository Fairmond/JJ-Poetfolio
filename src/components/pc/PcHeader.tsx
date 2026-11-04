import React from 'react';
import { ContactType } from '../../types';

interface PcHeaderProps {
  scale: number;
  onOpenContact: (type: ContactType) => void;
}

export const PcHeader: React.FC<PcHeaderProps> = ({ scale, onOpenContact }) => {
  const headerPaddingTop = 31 * scale;
  const headerPaddingSide = 70 * scale;
  const headerLogoWidth = 39 * scale;
  const headerLogoHeight = 54 * scale;
  const headerFontSize = 30 * scale;

  return (
    <header
      className="absolute top-0 left-0 right-0 w-full z-30 flex items-center justify-between pointer-events-none transition-all duration-300 ease-out"
      style={{
        paddingTop: `${headerPaddingTop}px`,
        paddingLeft: `${headerPaddingSide}px`,
        paddingRight: `${headerPaddingSide}px`,
      }}
    >
      {/* Top Left Logo Icon */}
      <div
        className="pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity flex items-center"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <img
          src="/pc_card_image.png"
          alt="Logo"
          className="object-contain select-none"
          draggable={false}
          style={{
            width: `${headerLogoWidth}px`,
            height: `${headerLogoHeight}px`,
          }}
        />
      </div>

      {/* Center Title: Portfolio */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex items-center justify-center">
        <span
          className="text-[#292727] font-medium tracking-normal select-none leading-none"
          style={{
            fontFamily: "CenturyGothic, 'Century Gothic', sans-serif",
            fontSize: `${headerFontSize}px`,
          }}
        >
          Portfolio
        </span>
      </div>

      {/* Right Link: Connect me */}
      <div
        className="pointer-events-auto cursor-pointer hover:opacity-70 transition-opacity flex items-center"
        onClick={() => onOpenContact('wechat')}
      >
        <span
          className="text-[#292727] font-medium tracking-normal select-none leading-none"
          style={{
            fontFamily: "CenturyGothic, 'Century Gothic', sans-serif",
            fontSize: `${headerFontSize}px`,
          }}
        >
          Connect me
        </span>
      </div>
    </header>
  );
};
