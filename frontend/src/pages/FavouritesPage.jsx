import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ShopCard from '../components/shops/ShopCard';
import ShopDetailModal from '../components/common/ShopDetailModal';
import BottomNav from '../components/layout/BottomNav';
import { Heart, Search, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function FavouritesPage() {
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shopnear_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShopForModal, setSelectedShopForModal] = useState(null);

  // Fetch real registered shops from MongoDB
  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/shops/public`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.shops)) {
            setAllShops(data.shops);
          }
        }
      } catch (err) {
        console.error('Error fetching shops for favourites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Filter only shops that match user saved favorite IDs
  const favoriteShops = allShops.filter((shop) =>
    favoriteIds.includes(shop._id || shop.id)
  );

  const handleToggleFavorite = (shopId) => {
    setFavoriteIds((prev) => {
      const isAlready = prev.includes(shopId);
      let updated;
      if (isAlready) {
        toast.info('Removed from favourites');
        updated = prev.filter((id) => id !== shopId);
      } else {
        toast.success('Added to favourites');
        updated = [...prev, shopId];
      }
      try {
        localStorage.setItem('shopnear_favorites', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save favorites to localStorage:', e);
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] selection:bg-[#16A34A] selection:text-white">
      <Navbar activeTab="favourites" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-20 lg:pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-50 text-red-500">
                <Heart className="w-5 h-5 fill-red-500" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                Favourites
              </h1>
            </div>
            <p className="text-sm text-[#64748B] mt-1.5">
              Quick access to your saved neighborhood stores, services, and favorite spots.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#16A34A] hover:text-[#0F7A44] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Explore more shops</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* List Section */}
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#64748B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#16A34A]" />
            </div>
          ) : favoriteShops.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                No favorite shops saved yet
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                Browse nearby shops on the home page and tap the heart icon to easily save them here for quick access later.
              </p>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Browse Nearby Shops</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteShops.map((shop) => (
                <ShopCard
                  key={shop._id || shop.id}
                  shop={shop}
                  isFavorite={favoriteIds.includes(shop._id || shop.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onViewDetails={(s) => setSelectedShopForModal(s)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Interactive Shop Detail Modal */}
        {selectedShopForModal && (
          <ShopDetailModal
            shop={selectedShopForModal}
            onClose={() => setSelectedShopForModal(null)}
          />
        )}
      </main>

      {/* Mobile/Tablet Fixed Bottom Navigation (< 1024px) */}
      <BottomNav />
    </div>
  );
}
