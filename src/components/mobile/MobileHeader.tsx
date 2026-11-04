import React from 'react';
import { SafeImage } from '../SafeImage';

interface MobileHeaderProps {
  onLogoClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="w-full px-5 pt-3 pb-1 flex items-center justify-between z-20 relative">
      <div className="flex items-center gap-2">
        <SafeImage
          src="/mobile_header_logo.png"
          alt="Logo"
          className="w-[23px] h-[33px] object-contain cursor-pointer active:opacity-75 transition-opacity"
          onClick={onLogoClick}
        />
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-[#292727] text-[18px] tracking-wide"
          style={{ fontFamily: 'CenturyGothic, "Century Gothic", sans-serif' }}
        >
          Portfolio
        </span>
      </div>
    </header>
  );
};
