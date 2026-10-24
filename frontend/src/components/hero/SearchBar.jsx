import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, ChevronDown, Check, Tag, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationSelect,
  onSearchSubmit,
}) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const locationRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationOpen(false);
      }
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Instant Local Category Suggestions while user types
  const getLocalCategorySuggestions = useCallback((q) => {
    if (!q || !q.trim()) return [];
    const term = q.trim().toLowerCase();
    const results = [];
    const seen = new Set();

    // Matching ONLY categories
    CATEGORIES.forEach((cat) => {
      if (
        cat.name.toLowerCase().includes(term) ||
        cat.query.toLowerCase().includes(term) ||
        (cat.subtitle && cat.subtitle.toLowerCase().includes(term))
      ) {
        results.push({
          type: 'category',
          text: cat.name,
          label: cat.name,
          detail: cat.subtitle,
        });
        seen.add(cat.name.toLowerCase());
      }
    });

    return results;
  }, []);

  // Fetch Live Server Category Suggestions
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setActiveIndex(-1);
      return;
    }

    // 1. Set local matching categories immediately (0ms)
    const instantLocal = getLocalCategorySuggestions(q);
    setSuggestions(instantLocal);
    setSuggestionsOpen(true);
    setActiveIndex(-1);

    // 2. Fetch server-side category suggestions with debounced cancellation
    const controller = new AbortController();
    const fetchTimer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/shops/suggestions?q=${encodeURIComponent(q)}`,
          {
            signal: controller.signal,
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            // Keep ONLY categories
            const seen = new Set();
            const merged = [];

            // Server categories
            data.suggestions.forEach((item) => {
              if (item.type === 'category') {
                const key = item.text.toLowerCase();
                if (!seen.has(key)) {
                  merged.push(item);
                  seen.add(key);
                }
              }
            });

            // Merge local categories
            instantLocal.forEach((item) => {
              const key = item.text.toLowerCase();
              if (!seen.has(key)) {
                merged.push(item);
                seen.add(key);
              }
            });

            setSuggestions(merged.slice(0, 8));
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Error loading category suggestions:', err);
        }
      }
    }, 150);

    return () => {
      clearTimeout(fetchTimer);
      controller.abort();
    };
  }, [searchQuery, getLocalCategorySuggestions]);

  // Handle explicit selection
  const handleSelectSuggestion = (itemText) => {
    onSearchChange(itemText);
    setSuggestionsOpen(false);
    if (onSearchSubmit) onSearchSubmit(itemText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuggestionsOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelectSuggestion(suggestions[activeIndex].text);
    } else if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!suggestionsOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeIndex].text);
    }
  };

  const handleSelectLoc = (loc) => {
    onLocationSelect(loc);
    setLocationOpen(false);
  };

  // Highlight matching characters in category name
  const renderHighlightedText = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="text-[#16A34A] font-bold">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <form
        onSubmit={handleSubmit}
        className="relative w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] focus-within:border-[#16A34A] focus-within:ring-2 focus-within:ring-[#16A34A]/20 transition-all p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 z-20"
      >
        {/* 1. Search Query Input */}
        <div className="flex-1 flex items-center px-3 py-1.5 min-w-0 relative">
          <Search className="w-5 h-5 text-[#94A3B8] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setSuggestionsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for shops, services, or categories (e.g. stationery, sweets, photocopy)..."
            aria-label="Search query"
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-[#0F172A] placeholder-[#94A3B8] text-sm md:text-[15px] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setSuggestions([]);
                setSuggestionsOpen(false);
              }}
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
        <div className="relative" ref={locationRef}>
          <button
            type="button"
            onClick={() => setLocationOpen(!locationOpen)}
            aria-expanded={locationOpen}
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
                locationOpen ? 'rotate-180 text-[#16A34A]' : ''
              }`}
            />
          </button>

          {locationOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                Location
              </div>

              <button
                type="button"
                onClick={() => handleSelectLoc('Use my current location')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left hover:bg-[#F0FDF4] rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[#16A34A] font-semibold">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Use my current location (GPS)</span>
                </div>
                {selectedLocation === 'Use my current location' && (
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                )}
              </button>
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

      {/* 4. Category-Only Autocomplete Suggestions Floating Dropdown */}
      {suggestionsOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-40 overflow-hidden divide-y divide-[#F1F5F9] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-2 bg-[#F8FAFC] flex items-center justify-between text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            <span>Categories for &ldquo;{searchQuery}&rdquo;</span>
            <span className="text-[10px] text-[#94A3B8]">Press &uarr;&darr; to navigate, Enter to select</span>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {suggestions.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <li key={`${item.type}-${item.text}-${idx}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelectSuggestion(item.text)}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F0FDF4] text-[#16A34A]' : 'hover:bg-slate-50 text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 truncate">
                        <div className="text-xs sm:text-sm font-semibold truncate">
                          {renderHighlightedText(item.label, searchQuery)}
                        </div>
                        {item.detail && (
                          <div className="text-[10px] text-[#64748B] truncate">
                            {item.detail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        Category
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
