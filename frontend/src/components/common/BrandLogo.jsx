import React from 'react';

export default function BrandLogo({ size = 'default', showTagline = true, className = '' }) {
  const isSmall = size === 'small';
  
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* ShopNear Location Pin Logo Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          className={isSmall ? "w-5 h-6" : "w-7 h-8 sm:w-8 sm:h-9"}
          viewBox="0 0 32 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Pin Body */}
          <path
            d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 22 16 22s16-10.8 16-22C32 7.163 24.837 0 16 0Z"
            fill="#16A34A"
          />
          {/* Inner Circle Cutout */}
          <circle cx="16" cy="15" r="6" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Text & Tagline */}
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className={`font-bold tracking-tight text-[#0F172A] ${
            isSmall ? "text-base" : "text-lg sm:text-2xl"
          }`}
          style={{ letterSpacing: '-0.02em' }}
        >
          <span>Shop</span>
          <span className="text-[#16A34A]">Near</span>
        </span>
        {showTagline && (
          <span className="text-[10px] sm:text-[11px] font-normal text-[#64748B] -mt-0.5 tracking-tight truncate">
            Discover Shops Around You
          </span>
        )}
      </div>
    </div>
  );
}
