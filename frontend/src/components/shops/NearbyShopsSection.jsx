import React, { useState, useRef, useEffect } from 'react';
import ShopCard from './ShopCard';
import { MapPin, ChevronDown, Check, Store } from 'lucide-react';
import { AVAILABLE_LOCATIONS } from '../../data/mockData';

export default function NearbyShopsSection({
  shops,
  selectedLocation,
  onLocationSelect,
  favorites,
  onToggleFavorite,
  onViewDetails,
  onResetFilters,
}) {
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const locRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (locRef.current && !locRef.current.contains(e.target)) {
        setLocDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section id="nearby-shops" className="py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Nearby Shops
          </h2>

          {/* Right Location Selector */}
          <div className="relative" ref={locRef}>
            <button
              type="button"
              onClick={() => setLocDropdownOpen(!locDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F172A] hover:text-[#16A34A] transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100/70"
            >
              <MapPin className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>{selectedLocation || 'Gurgaon, Haryana'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${
                  locDropdownOpen ? 'rotate-180 text-[#16A34A]' : ''
                }`}
              />
            </button>

            {locDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Select City / Area
                </div>
                {AVAILABLE_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        onLocationSelect(loc);
                        setLocDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-[#F0FDF4] text-[#16A34A] font-semibold'
                          : 'text-[#0F172A] hover:bg-slate-50'
                      }`}
                    >
                      <span>{loc}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Shop Cards Grid */}
        {shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {shops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                isFavorite={favorites.includes(shop.id)}
                onToggleFavorite={onToggleFavorite}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-10 text-center max-w-md mx-auto my-6">
            <div className="w-12 h-12 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">No shops match your search</h3>
            <p className="text-xs text-[#64748B] mt-1 mb-4">
              Try searching with a different keyword like "photocopy", "sweets", or "mobile".
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Clear filters & show all shops
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
