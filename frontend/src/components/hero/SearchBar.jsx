import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Check } from 'lucide-react';
import { AVAILABLE_LOCATIONS } from '../../data/mockData';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationSelect,
  onSearchSubmit,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(searchQuery);
  };

  const handleSelectLoc = (loc) => {
    onLocationSelect(loc);
    setDropdownOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2"
    >
      {/* 1. Search Query Input */}
      <div className="flex-1 flex items-center px-3 py-1.5 min-w-0">
        <Search className="w-5 h-5 text-[#94A3B8] shrink-0 mr-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search for shops, services, or categories..."
          aria-label="Search query"
          className="w-full min-w-0 bg-transparent text-[#0F172A] placeholder-[#94A3B8] text-sm md:text-[15px] focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-xs text-[#94A3B8] hover:text-[#0F172A] px-1 py-0.5"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Vertical separator on desktop */}
      <div className="hidden md:block w-px h-8 bg-[#E2E8F0]" />

      {/* 2. Location Selector Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          className="w-full md:w-auto flex items-center justify-between gap-2 px-3 py-2 text-xs md:text-sm font-medium text-[#0F172A] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-[#E2E8F0] md:border-transparent"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[180px]">
              {selectedLocation || 'Use my current location'}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180 text-[#16A34A]' : ''
            }`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Choose Location
            </div>

            <button
              type="button"
              onClick={() => handleSelectLoc('Use my current location')}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-[#F0FDF4] transition-colors"
            >
              <div className="flex items-center gap-2 text-[#16A34A] font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>Use my current location (GPS)</span>
              </div>
              {selectedLocation === 'Use my current location' && (
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              )}
            </button>

            <div className="my-1 border-t border-[#E2E8F0]" />

            {AVAILABLE_LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleSelectLoc(loc)}
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

      {/* 3. Primary Green Search Button */}
      <button
        type="submit"
        className="shrink-0 px-6 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
      >
        <span>Search</span>
      </button>
    </form>
  );
}
