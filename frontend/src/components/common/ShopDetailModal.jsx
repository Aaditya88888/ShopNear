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
} from 'lucide-react';

export default function ShopDetailModal({ shop, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!shop) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Banner */}
        <div className="relative h-48 w-full bg-slate-100">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#22C55E]">
              {shop.isOpen ? 'Open Now' : 'Closed'}
            </span>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold">{shop.rating}</span>
              <span className="text-slate-300">({shop.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">{shop.name}</h2>
            <p className="text-xs font-medium text-[#16A34A] mt-0.5">
              {shop.categories}
            </p>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              {shop.description}
            </p>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F172A]">Operating Hours</p>
                <p className="text-[#64748B] mt-0.5">{shop.hours}</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F172A]">Distance</p>
                <p className="text-[#64748B] mt-0.5">{shop.distance} from your location</p>
              </div>
            </div>
          </div>

          {/* Address & Phone */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <p className="text-[#0F172A]">{shop.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#64748B] shrink-0" />
              <a
                href={`tel:${shop.phone}`}
                className="text-[#16A34A] font-medium hover:underline"
              >
                {shop.phone}
              </a>
            </div>
          </div>

          {/* Available Services */}
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Available Services
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0F172A]">
              {shop.services?.map((srv, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>{srv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(shop.name + ' ' + shop.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
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
