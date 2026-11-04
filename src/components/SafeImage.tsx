import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  placeholderClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  fallbackSrc,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden inline-flex items-center justify-center ${className}`}>
      {/* Loading Skeleton / Shimmer Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 bg-[#ebe7df] animate-pulse rounded-[inherit] flex items-center justify-center ${placeholderClassName}`}
        >
          <div className="w-1/3 h-1/3 bg-[#dfdacd] rounded-full opacity-40 animate-ping" />
        </div>
      )}

      {/* Error State Fallback */}
      {hasError ? (
        fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className={`w-full h-full object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsLoaded(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#f2eee6] border border-dashed border-[#d1cbbe] rounded-[inherit] flex flex-col items-center justify-center p-1 text-[#9e978b]">
            <svg
              className="w-4 h-4 opacity-60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
