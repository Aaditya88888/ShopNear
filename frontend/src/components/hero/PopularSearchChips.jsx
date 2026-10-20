import React from 'react';
import { MapPin } from 'lucide-react';
import { POPULAR_SEARCHES } from '../../data/mockData';

export default function PopularSearchChips({ onSelectChip, activeQuery }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
      <div className="inline-flex items-center gap-1 text-[#0F172A] font-medium mr-1 select-none shrink-0">
        <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
        <span className="font-semibold text-xs sm:text-[13px]">Popular searches:</span>
      </div>

      {POPULAR_SEARCHES.map((chip) => {
        const isSelected = activeQuery?.toLowerCase() === chip.toLowerCase();
        return (
          <button
            key={chip}
            type="button"
            onClick={() => onSelectChip(chip)}
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-normal border transition-all duration-150 cursor-pointer shadow-2xs shrink-0 ${
              isSelected
                ? 'bg-[#16A34A] text-white border-[#16A34A] font-medium shadow-xs'
                : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#16A34A] hover:border-[#16A34A] hover:bg-[#F0FDF4]'
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
