import React, { useState, useRef, useEffect } from 'react';
import ShopCard from './ShopCard';
import { MapPin, ChevronDown, Check, Store } from 'lucide-react';

export default function NearbyShopsSection({
  shops,
  selectedLocation,
  onLocationSelect,
  favorites,
  onToggleFavorite,
  onViewDetails,
  onResetFilters,
  loading = false,
  isGpsActive = false,
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
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Nearby Shops
            </h2>
            {isGpsActive && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7FBF1] text-[#00C66B] border border-[#D1F2DE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C66B] animate-pulse"></span>
                <span>Sorted Nearest First</span>
              </span>
            )}
          </div>

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
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Location
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLocationSelect('Use my current location');
                    setLocDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-[#F0FDF4] rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[#16A34A] font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Use my current location (GPS)</span>
                  </div>
                  {selectedLocation === 'Use my current location' && (
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shop Cards Grid or Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 h-64 flex flex-col justify-between">
                <div className="bg-slate-200 h-32 rounded-xl w-full"></div>
                <div className="space-y-2 mt-3">
                  <div className="bg-slate-200 h-4 rounded-md w-3/4"></div>
                  <div className="bg-slate-200 h-3 rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {shops.map((shop) => (
              <ShopCard
                key={shop._id || shop.id}
                shop={shop}
                isFavorite={favorites.includes(shop._id || shop.id)}
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
            <h3 className="text-base font-bold text-[#0F172A]">
              {isGpsActive ? 'No nearby shops found in this area' : 'No shops available'}
            </h3>
            <p className="text-xs text-[#64748B] mt-1 mb-4 leading-relaxed">
              {isGpsActive
                ? "We couldn't find any registered shops within 25 km of your location. Try clearing filters or adding your shop."
                : 'No registered shops found. You can register your own shop on the My Shops page!'}
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Clear filters & show all shops
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
