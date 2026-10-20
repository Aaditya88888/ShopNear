import React, { useState, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/hero/HeroSection';
import CategorySection from '../components/categories/CategorySection';
import NearbyShopsSection from '../components/shops/NearbyShopsSection';
import PromotionalBanner from '../components/banner/PromotionalBanner';
import ShopDetailModal from '../components/common/ShopDetailModal';
import { NEARBY_SHOPS } from '../data/mockData';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Gurgaon, Haryana');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState(['mobile-world']);
  const [selectedShopForModal, setSelectedShopForModal] = useState(null);
  const [showAboutToast, setShowAboutToast] = useState(false);

  // Filter shops based on search query and category
  const filteredShops = useMemo(() => {
    return NEARBY_SHOPS.filter((shop) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        shop.name.toLowerCase().includes(query) ||
        shop.categories.toLowerCase().includes(query) ||
        shop.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchesCategory =
        !selectedCategory ||
        shop.categories.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        shop.tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleToggleFavorite = (shopId) => {
    setFavorites((prev) =>
      prev.includes(shopId)
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId]
    );
  };

  const handleSelectChip = (chipText) => {
    setSearchQuery(chipText);
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
      const el = document.getElementById('nearby-shops');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
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
          onLocationSelect={setSelectedLocation}
          onSearchSubmit={() => {
            const el = document.getElementById('nearby-shops');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectChip={handleSelectChip}
        />

        {/* 3. Explore Categories Section */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onResetFilter={handleResetFilters}
        />

        {/* 4. Nearby Shops Section */}
        <NearbyShopsSection
          shops={filteredShops}
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onViewDetails={(shop) => setSelectedShopForModal(shop)}
          onResetFilters={handleResetFilters}
        />

        {/* 5. Promotional Footer Banner */}
        <PromotionalBanner />
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-[#E2E8F0] bg-white text-center text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 ShopNear. Empowering local neighborhood businesses & everyday convenience.</p>
        </div>
      </footer>

      {/* Interactive Shop Detail Modal */}
      {selectedShopForModal && (
        <ShopDetailModal
          shop={selectedShopForModal}
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
              ShopNear connects daily commuters and newcomers with trusted local shops in Delhi, Gurgaon & beyond.
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
    </div>
  );
}
