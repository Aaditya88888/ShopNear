import React from 'react';
import BrandLogo from '../common/BrandLogo';
import bannerArt from '../../assets/hero/banner-shops.png';

export default function PromotionalBanner() {
  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#ECF7F3] border border-[#D1EFE5] rounded-2xl sm:rounded-3xl p-5 sm:px-7 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 shadow-2xs">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-5 shrink-0 w-full md:w-auto justify-between md:justify-start">
            <BrandLogo size="default" />
            {/* Vertical Divider (Desktop) */}
            <div className="hidden md:block w-px h-10 bg-[#CBD5E1]" />
          </div>

          {/* Middle: Promotional Message */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug">
              Find the right shop, before you leave.
            </h3>
            <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed">
              See business hours, available services and distance — all in one place.
            </p>
          </div>

          {/* Right: Line Art Storefronts Illustration */}
          <div className="shrink-0 flex items-center justify-center">
            <img
              src={bannerArt}
              alt="Neighborhood shops line art"
              className="h-12 sm:h-14 w-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
