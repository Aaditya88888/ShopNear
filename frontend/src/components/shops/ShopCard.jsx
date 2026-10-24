import React from 'react';
import { Star, MapPin, Heart, ArrowRight } from 'lucide-react';

export default function ShopCard({
  shop,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
}) {
  return (
    <div className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative w-full h-34 sm:h-36 overflow-hidden bg-slate-100">
        <img
          src={shop.image}
          alt={`${shop.name} storefront`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Status Badge (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-xs ${
              shop.isOpen ? 'bg-[#22C55E]' : 'bg-red-500'
            }`}
          >
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>
          {shop.distanceText && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white">
              {shop.distanceText}
            </span>
          )}
        </div>

        {/* Favorite Heart Button (Top-Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(shop.id || shop._id);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all duration-150 cursor-pointer active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? 'fill-[#EF4444] text-[#EF4444]'
                : 'text-white hover:text-red-200'
            }`}
          />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Shop Name */}
          <h3 className="font-bold text-[#0F172A] text-[15px] sm:text-base leading-snug group-hover:text-[#16A34A] transition-colors line-clamp-1">
            {shop.name}
          </h3>

          {/* Rating Row */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-xs font-bold text-[#0F172A]">
              {shop.rating}
            </span>
            <span className="text-xs text-[#64748B]">
              ({shop.reviews} reviews)
            </span>
          </div>

          {/* Categories Subtitle */}
          <p className="text-xs text-[#64748B] mt-1.5 line-clamp-1 font-normal">
            {shop.categories}
          </p>

          {/* Distance & Hours Metadata Row */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#64748B] mt-2.5 pt-2 border-t border-[#F1F5F9]">
            <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
            <span className="font-medium text-[#0F172A]">
              {shop.distanceText || shop.distance || 'Near you'}
            </span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="truncate">{shop.hours}</span>
          </div>
        </div>

        {/* View Details Outlined Button */}
        <div className="pt-3.5 mt-auto">
          <button
            type="button"
            onClick={() => onViewDetails(shop)}
            className="w-full py-2 px-3 text-xs sm:text-[13px] font-semibold text-[#16A34A] bg-white border border-[#16A34A]/40 hover:border-[#16A34A] hover:bg-[#F0FDF4] active:bg-[#DCFCE7] rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
