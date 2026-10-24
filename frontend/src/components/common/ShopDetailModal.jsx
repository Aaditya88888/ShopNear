import React, { useEffect } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Share2,
  Navigation,
  Compass,
} from 'lucide-react';
import LeafletMap from './LeafletMap';

export default function ShopDetailModal({ shop, userCoords, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!shop) return null;

  // Extract coordinates [longitude, latitude]
  const shopCoordinates =
    shop.location?.coordinates ||
    (Array.isArray(shop.coordinates) && shop.coordinates.length === 2
      ? shop.coordinates
      : null);

  // Construct safe Google Maps universal directions URL
  const getDirectionsUrl = () => {
    if (shopCoordinates && shopCoordinates.length === 2) {
      const [shopLng, shopLat] = shopCoordinates;
      const params = new URLSearchParams({
        api: '1',
        destination: `${shopLat},${shopLng}`,
      });

      if (userCoords && userCoords.lat && userCoords.lng) {
        params.set('origin', `${userCoords.lat},${userCoords.lng}`);
      }

      return `https://www.google.com/maps/dir/?${params.toString()}`;
    }

    // Fallback to shop name + address query if coordinates are absent
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      shop.name + ' ' + (shop.address || '')
    )}`;
  };

  const displayDistance =
    shop.distanceText ||
    (shop.distance ? `${shop.distance} from your location` : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Banner */}
        <div className="relative h-44 sm:h-48 w-full bg-slate-100 shrink-0">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                shop.isOpen ? 'bg-[#22C55E]' : 'bg-red-500'
              }`}
            >
              {shop.isOpen ? 'Open Now' : 'Closed'}
            </span>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold">{shop.rating || 4.5}</span>
              <span className="text-slate-300">
                ({shop.reviews || 42} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0F172A]">{shop.name}</h2>
              {shop.distanceText && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7FBF1] text-[#00C66B] border border-[#D1F2DE]">
                  {shop.distanceText}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-[#16A34A] mt-0.5">
              {shop.category || shop.categories}
            </p>
            {shop.description && (
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                {shop.description}
              </p>
            )}
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F172A]">Operating Hours</p>
                <p className="text-[#64748B] mt-0.5">{shop.hours || '9:00 AM - 9:00 PM'}</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F172A]">Distance</p>
                <p className="text-[#64748B] mt-0.5">
                  {displayDistance || 'Nearby location'}
                </p>
              </div>
            </div>
          </div>

          {/* Address & Phone */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <p className="text-[#0F172A]">{shop.address}</p>
            </div>
            {shop.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#64748B] shrink-0" />
                <a
                  href={`tel:${shop.phone}`}
                  className="text-[#16A34A] font-medium hover:underline"
                >
                  {shop.phone}
                </a>
              </div>
            )}
          </div>

          {/* Interactive Map Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Shop Map & Location</span>
              </h4>
              <span className="text-[11px] text-[#64748B]">
                {userCoords ? '🔵 Your location & 🟢 Shop' : '🟢 Shop location'}
              </span>
            </div>

            {shopCoordinates ? (
              <LeafletMap
                shopCoords={shopCoordinates}
                userCoords={userCoords}
                shopName={shop.name}
                shopAddress={shop.address}
                height="190px"
              />
            ) : (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl text-center text-xs text-[#64748B]">
                <MapPin className="w-5 h-5 text-[#94A3B8] mx-auto mb-1" />
                <p>Specific GPS pin not set for this shop yet.</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Address: {shop.address}
                </p>
              </div>
            )}
          </div>

          {/* Available Services */}
          {shop.services && shop.services.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Available Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0F172A]">
                {shop.services.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Directions and Share */}
          <div className="pt-2 flex gap-3">
            <a
              href={getDirectionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: shop.name,
                    text: `Check out ${shop.name} on ShopNear!`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Shop link copied to clipboard!');
                }
              }}
              className="px-4 py-2.5 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#64748B]" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
