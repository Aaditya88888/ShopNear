import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/hero/HeroSection';
import CategorySection from '../components/categories/CategorySection';
import NearbyShopsSection from '../components/shops/NearbyShopsSection';
import PromotionalBanner from '../components/banner/PromotionalBanner';
import ShopDetailModal from '../components/common/ShopDetailModal';
import Footer from '../components/layout/Footer';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Use my current location');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('shopnear_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedShopForModal, setSelectedShopForModal] = useState(null);
  const [showAboutToast, setShowAboutToast] = useState(false);

  // Proximity & Real Database Shops State
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [isLocating, setIsLocating] = useState(false);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]); // Stores ONLY real shops from MongoDB

  // JavaScript Debounce (300ms) with timer cleanup to avoid firing API requests on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Fetch Real Public Shops from MongoDB
  const fetchPublicShops = useCallback(async (category, query) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category.trim()) params.append('category', category.trim());
      if (query && query.trim()) params.append('query', query.trim());

      const res = await fetch(`${API_BASE}/shops/public?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.shops)) {
          setShops(data.shops);
        } else {
          setShops([]);
        }
      } else {
        setShops([]);
      }
    } catch (err) {
      console.error('Error fetching public shops:', err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Nearby Proximity Shops from MongoDB via $geoNear
  const fetchNearbyShops = useCallback(async (coords, category, query) => {
    if (!coords || !coords.lat || !coords.lng) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: coords.lat.toString(),
        lng: coords.lng.toString(),
        radiusKm: '25',
      });
      if (category && category.trim()) params.append('category', category.trim());
      if (query && query.trim()) params.append('query', query.trim());

      const res = await fetch(`${API_BASE}/shops/nearby?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.shops)) {
          setShops(data.shops);
          setIsGpsActive(true);
        } else {
          setShops([]);
        }
      } else {
        setShops([]);
      }
    } catch (err) {
      console.error('Error fetching nearby shops:', err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced load and whenever auth user or category/debouncedQuery changes: Fetch real shops
  useEffect(() => {
    if (isGpsActive && userCoords) {
      fetchNearbyShops(userCoords, selectedCategory, debouncedQuery);
    } else {
      fetchPublicShops(selectedCategory, debouncedQuery);
    }
  }, [fetchPublicShops, fetchNearbyShops, selectedCategory, debouncedQuery, user, isGpsActive, userCoords]);

  // Request User Location from Browser
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    toast.info('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserCoords(coords);
        setIsLocating(false);

        // Reverse geocode to get locality label
        try {
          const revRes = await fetch(
            `${API_BASE}/shops/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            if (revData.success) {
              const label =
                revData.locality || revData.city
                  ? `${revData.locality || revData.city}, ${revData.state || ''}`.replace(/,\s*$/, '')
                  : 'My Current Location';
              setSelectedLocation(label);
              toast.success(`Location set: ${label}`);
            }
          }
        } catch (revErr) {
          console.warn('Reverse geocoding error:', revErr);
          setSelectedLocation('Current Location');
        }

        // Fetch nearby real shops
        fetchNearbyShops(coords, selectedCategory, debouncedQuery);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        if (err.code === 1) {
          toast.warn('Location permission was denied. Showing all registered shops.');
        } else {
          toast.warn('Could not detect GPS location. Showing all registered shops.');
        }
        setIsGpsActive(false);
        fetchPublicShops(selectedCategory, debouncedQuery);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchNearbyShops, fetchPublicShops, selectedCategory, debouncedQuery]);

  // Handle location selector clicks
  const handleLocationSelect = (loc) => {
    if (loc === 'Use my current location') {
      requestLocation();
    } else {
      setSelectedLocation(loc);
      setIsGpsActive(false);
      fetchPublicShops(selectedCategory, debouncedQuery);
    }
  };

  const handleToggleFavorite = (shopId) => {
    setFavorites((prev) => {
      const isAlready = prev.includes(shopId);
      const updated = isAlready
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId];
      try {
        localStorage.setItem('shopnear_favorites', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save favorites to localStorage:', e);
      }
      return updated;
    });
  };

  // Immediate search on submit or selection (bypasses debounce wait)
  const handleSearchSubmit = (submittedQuery) => {
    const term = submittedQuery !== undefined ? submittedQuery : searchQuery;
    setSearchQuery(term);
    setDebouncedQuery(term);
    if (isGpsActive && userCoords) {
      fetchNearbyShops(userCoords, selectedCategory, term);
    } else {
      fetchPublicShops(selectedCategory, term);
    }
    const el = document.getElementById('nearby-shops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectChip = (chipText) => {
    setSearchQuery(chipText);
    setDebouncedQuery(chipText);
    setSelectedCategory(chipText);
    const el = document.getElementById('nearby-shops');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryQuery) => {
    if (selectedCategory === categoryQuery) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryQuery);
      setSearchQuery(categoryQuery);
      setDebouncedQuery(categoryQuery);
      const el = document.getElementById('nearby-shops');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedCategory(null);
    setIsGpsActive(false);
    setUserCoords(null);
    setSelectedLocation('Use my current location');
    fetchPublicShops(null, '');
  };

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'categories') {
      const el = document.getElementById('categories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tabId === 'about') {
      setShowAboutToast(true);
      setTimeout(() => setShowAboutToast(false), 5000);
    }
  };

  // Filter out any shop owned by the currently logged-in user
  const displayedShops = useMemo(() => {
    if (!user) return shops;
    const currentUserId = user._id || user.id;
    return shops.filter((shop) => {
      const ownerId = shop.owner?._id || shop.owner?.id || shop.owner;
      if (currentUserId && ownerId && String(ownerId) === String(currentUserId)) {
        return false;
      }
      return true;
    });
  }, [shops, user]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] selection:bg-[#16A34A] selection:text-white overflow-x-hidden w-full">
      {/* 1. Navbar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onSearchSubmit={handleSearchSubmit}
          onSelectChip={handleSelectChip}
        />

        {/* 3. Explore Categories Section */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onResetFilter={handleResetFilters}
        />

        {/* 4. Nearby Shops Section (100% Real MongoDB Data - Excludes User's Own Shops) */}
        <NearbyShopsSection
          shops={displayedShops}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onViewDetails={(shop) => setSelectedShopForModal(shop)}
          onResetFilters={handleResetFilters}
          loading={loading || isLocating}
          isGpsActive={isGpsActive}
        />

        {/* 5. Promotional Footer Banner */}
        <PromotionalBanner />
      </main>

      {/* Redesigned Modern App & Desktop Footer */}
      <Footer />

      {/* Interactive Shop Detail Modal */}
      {selectedShopForModal && (
        <ShopDetailModal
          shop={selectedShopForModal}
          userCoords={userCoords}
          onClose={() => setSelectedShopForModal(null)}
        />
      )}

      {/* About Notification Banner */}
      {showAboutToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom duration-200 max-w-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping" />
          <div className="text-xs">
            <p className="font-semibold text-white">About ShopNear</p>
            <p className="text-slate-300 mt-0.5">
              ShopNear connects daily commuters and newcomers with trusted local shops in your neighborhood.
            </p>
          </div>
          <button
            onClick={() => setShowAboutToast(false)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile/Tablet Fixed Bottom Navigation (< 1024px) */}
      <BottomNav />
    </div>
  );
}
