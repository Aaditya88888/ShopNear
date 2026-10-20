import React from 'react';
import SearchBar from './SearchBar';
import PopularSearchChips from './PopularSearchChips';
import heroIllustration from '../../assets/hero/hero-shops.png';

export default function HeroSection({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationSelect,
  onSearchSubmit,
  onSelectChip,
}) {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#EFF9F5]/70 via-[#F5FCF8]/50 to-[#F8FAFC]">
      {/* Decorative ambient subtle background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#DCFCE7]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-[#E0F2FE]/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-w-0">
          {/* Left Column: Headline, Search, Chips */}
          <div className="lg:col-span-7 min-w-0 flex flex-col space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0F172A] leading-[1.18] tracking-tight">
                Find the Best Shops <br className="block" />
                <span className="text-[#16A34A]">Near You</span>
              </h1>
              <p className="text-sm sm:text-[15px] text-[#64748B] max-w-xl leading-relaxed">
                Discover nearby shops, check their hours, explore products and services, and get directions — all in one place.
              </p>
            </div>

            {/* Combined Search Interface */}
            <div className="pt-1 w-full min-w-0">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                selectedLocation={selectedLocation}
                onLocationSelect={onLocationSelect}
                onSearchSubmit={onSearchSubmit}
              />
            </div>

            {/* Popular Search Chips */}
            <div className="w-full min-w-0">
              <PopularSearchChips
                onSelectChip={onSelectChip}
                activeQuery={searchQuery}
              />
            </div>
          </div>

          {/* Right Column: Neighborhood Shops Community Illustration */}
          <div className="lg:col-span-5 min-w-0 flex justify-center lg:justify-end items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-none min-w-0">
              <img
                src={heroIllustration}
                alt="ShopNear local community shops illustration - local shops, stronger communities"
                className="w-full max-w-full h-auto object-contain transition-transform duration-300 hover:scale-[1.01]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
