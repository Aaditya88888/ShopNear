import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Store,
  Plus,
  MapPin,
  Tag,
  Clock,
  Phone,
  MoreVertical,
  ChevronRight,
  BarChart2,
  ShieldCheck,
  AlertTriangle,
  X,
  Loader2,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ShopDetailModal from '../components/common/ShopDetailModal';
import LeafletMap from '../components/common/LeafletMap';
import BottomNav from '../components/layout/BottomNav';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Preset shop categories for easy selection
const CATEGORIES = [
  'Stationery',
  'Photocopy & Xerox',
  'Sweets & Mithai',
  'Bakery & Cakes',
  'Fruits',
  'Vegetables',
  'Grocery & Kirana',
  'Clothing & Apparel',
  'Tailor & Boutique',
  'Mobile & Phone Repair',
  'Pharmacy & Medical',
  'Electronics & Electricals',
  'Hardware & Sanitary',
  'Restaurant & Cafe',
  'General Store & Services',
  'Other',
];

export default function MyShopsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Active Selections
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sweets & Snacks',
    address: '',
    phone: '',
    hours: '9:00 AM - 9:00 PM',
    isOpen: true,
    image: '',
    coordinates: null, // [longitude, latitude]
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Auto-detect GPS location & reverse geocode address
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          coordinates: [longitude, latitude],
        }));

        try {
          const res = await fetch(
            `${API_BASE}/shops/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.address) {
              setFormData((prev) => ({
                ...prev,
                address: data.address,
              }));
              toast.success(`Location set: ${data.locality || data.city || 'Address detected'}`);
            }
          }
        } catch (err) {
          console.warn('Reverse geocoding error:', err);
          toast.info('GPS coordinates captured!');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        console.error('Geolocation error:', err);
        if (err.code === 1) {
          toast.error('Location permission was denied. Please allow location access or type address.');
        } else {
          toast.error('Could not detect location. Please enter address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleMapMarkerDrag = async (coords) => {
    // coords: [lng, lat]
    setFormData((prev) => ({ ...prev, coordinates: coords }));
    try {
      const [lng, lat] = coords;
      const res = await fetch(`${API_BASE}/shops/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.address) {
          setFormData((prev) => ({ ...prev, address: data.address }));
        }
      }
    } catch (err) {
      console.warn('Drag reverse geocode error:', err);
    }
  };

  // Fetch User's Shops
  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/shops/my-shops`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch your shops');
      const data = await res.json();
      if (data.success && Array.isArray(data.shops)) {
        setShops(data.shops);
      } else {
        setShops([]);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(err.message || 'Could not load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Close 3-dot dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Computed Quick Stats
  const totalShopsCount = shops.length;
  const openShopsCount = shops.filter((s) => s.isOpen !== false).length;
  const closedShopsCount = shops.filter((s) => s.isOpen === false).length;

  // Handle Create Shop
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Please enter the shop name and address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          address: formData.address.trim(),
          phone: formData.phone.trim() || '+91 98000 00000',
          hours: formData.hours.trim() || '9:00 AM - 9:00 PM',
          isOpen: formData.isOpen,
          image: formData.image.trim() || 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80',
          coordinates: formData.coordinates,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.shop) {
        setShops((prev) => [data.shop, ...prev]);
        setShowAddModal(false);
        setFormData({
          name: '',
          category: 'Sweets & Snacks',
          address: '',
          phone: '',
          hours: '9:00 AM - 9:00 PM',
          isOpen: true,
          image: '',
          coordinates: null,
        });
        toast.success('Your shop was added successfully!');
      } else {
        toast.error(data.message || 'Failed to add shop.');
      }
    } catch (err) {
      console.error('Error creating shop:', err);
      toast.error('Network error registering shop.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal with Shop Data
  const handleOpenEdit = (shop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name || '',
      category: shop.category || 'Sweets & Snacks',
      address: shop.address || '',
      phone: shop.phone || '',
      hours: shop.hours || '9:00 AM - 9:00 PM',
      isOpen: shop.isOpen !== false,
      image: shop.image || '',
      coordinates: shop.location?.coordinates || (Array.isArray(shop.coordinates) ? shop.coordinates : null),
    });
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  // Handle Edit/Update Shop
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/shops/${selectedShop._id || selectedShop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success && data.shop) {
        setShops((prev) =>
          prev.map((s) => ((s._id || s.id) === (selectedShop._id || selectedShop.id) ? data.shop : s))
        );
        setShowEditModal(false);
        setSelectedShop(null);
        toast.success('Shop details updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update shop.');
      }
    } catch (err) {
      console.error('Error updating shop:', err);
      toast.error('Network error updating shop.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Shop Open/Closed Quick Action
  const handleToggleStatus = async (shop) => {
    const newStatus = !shop.isOpen;
    try {
      const res = await fetch(`${API_BASE}/shops/${shop._id || shop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isOpen: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.shop) {
        setShops((prev) =>
          prev.map((s) => ((s._id || s.id) === (shop._id || shop.id) ? data.shop : s))
        );
        toast.success(`Shop is now ${newStatus ? 'Open' : 'Closed'}.`);
      } else {
        toast.error('Failed to change shop status.');
      }
    } catch (err) {
      toast.error('Network error changing status.');
    }
    setActiveMenuId(null);
  };

  // Handle Delete Shop
  const handleDeleteShop = async () => {
    if (!selectedShop) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/shops/${selectedShop._id || selectedShop.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShops((prev) => prev.filter((s) => (s._id || s.id) !== (selectedShop._id || selectedShop.id)));
        setShowDeleteModal(false);
        setSelectedShop(null);
        toast.success('Shop has been permanently deleted.');
      } else {
        toast.error(data.message || 'Failed to delete shop.');
      }
    } catch (err) {
      console.error('Error deleting shop:', err);
      toast.error('Network error deleting shop.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FE] flex flex-col text-[#0B2B50] selection:bg-[#00C66B] selection:text-white">
      {/* Existing Authenticated Navbar (Strictly Preserved) */}
      <Navbar activeTab="my-shops" />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: My Shops Main Panel (~72% on Desktop)       */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white rounded-3xl border border-[#DCEBFF] p-6 sm:p-7 shadow-xs">
              
              {/* Panel Header */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#F1F6FD]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E7FBF1] text-[#00C66B] flex items-center justify-center shrink-0 border border-[#D1F2DE]">
                    <Store className="w-5 h-5 text-[#00C66B]" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0B2B50] tracking-tight">
                      My Shops
                    </h1>
                    <p className="text-xs sm:text-sm text-[#4F7FB8] font-normal mt-0.5">
                      Manage your added shops on ShopNear
                    </p>
                  </div>
                </div>

                {/* Total Shops Count Badge */}
                <div className="inline-flex items-center px-3.5 py-1.5 bg-[#E7FBF1] text-[#00C66B] border border-[#D1F2DE] rounded-full text-xs font-semibold shrink-0">
                  {totalShopsCount} {totalShopsCount === 1 ? 'Shop' : 'Shops'}
                </div>
              </div>

              {/* Shop Listings Section */}
              <div className="mt-6">
                {loading ? (
                  /* Loading Skeletons */
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center justify-between p-4 border border-[#DCEBFF] rounded-2xl bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-28 h-28 bg-slate-100 rounded-xl" />
                          <div className="space-y-2.5">
                            <div className="w-36 h-4 bg-slate-100 rounded" />
                            <div className="w-24 h-3 bg-slate-100 rounded" />
                            <div className="w-44 h-3 bg-slate-100 rounded" />
                            <div className="w-16 h-5 bg-slate-100 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  /* Error State with Retry Button */
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 border border-red-200">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-[#0B2B50] text-base">{error}</h3>
                    <button
                      type="button"
                      onClick={fetchShops}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00C66B] hover:bg-[#078A4B] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Loading</span>
                    </button>
                  </div>
                ) : shops.length === 0 ? (
                  /* Empty State */
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#E7FBF1] text-[#00C66B] flex items-center justify-center mx-auto mb-3.5 border border-[#D1F2DE]">
                      <Store className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-[#0B2B50] text-base sm:text-lg">
                      No shops registered yet
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4F7FB8] mt-1.5 max-w-sm mx-auto leading-relaxed">
                      You haven&apos;t added any shop listings to ShopNear yet. Register your local shop now to get discovered by nearby customers.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/my-shops/new')}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#00C66B] hover:bg-[#078A4B] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register Your First Shop</span>
                    </button>
                  </div>
                ) : (
                  /* Real Shop Cards Stack */
                  <div className="space-y-4">
                    {shops.map((shop) => {
                      const shopId = shop._id || shop.id;
                      const isOpen = shop.isOpen !== false;

                      return (
                        <div
                          key={shopId}
                          onClick={() => setSelectedShop(shop)}
                          className="group border border-[#DCEBFF] hover:border-[#BFDBFE] rounded-2xl p-4 flex items-center justify-between gap-4 bg-white transition-all hover:shadow-xs cursor-pointer relative"
                        >
                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-4 min-w-0">
                            
                            {/* Thumbnail with lower-right circular store icon badge */}
                            <div className="relative w-28 h-28 sm:w-32 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-[#DCEBFF]">
                              <img
                                src={
                                  shop.image ||
                                  'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80'
                                }
                                alt={shop.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-white text-[#00C66B] border border-[#DCEBFF] flex items-center justify-center shadow-xs">
                                <Store className="w-3.5 h-3.5 text-[#00C66B]" />
                              </div>
                            </div>

                            {/* Details Column */}
                            <div className="min-w-0">
                              <h2 className="font-bold text-[#0B2B50] text-base sm:text-lg truncate group-hover:text-[#00C66B] transition-colors">
                                {shop.name}
                              </h2>

                              {/* Category with Tag Icon */}
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#4F7FB8] mt-1">
                                <Tag className="w-3.5 h-3.5 text-[#4F7FB8] shrink-0" />
                                <span className="truncate">{shop.category}</span>
                              </div>

                              {/* Address with Map-pin Icon */}
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#4F7FB8] mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-[#4F7FB8] shrink-0" />
                                <span className="truncate">{shop.address}</span>
                              </div>

                              {/* Open / Closed Status Pill */}
                              <div className="mt-2">
                                {isOpen ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7FBF1] text-[#00C66B] border border-[#D1F2DE]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C66B]" />
                                    <span>Open</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFE9E9] text-[#EF4444] border border-red-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                                    <span>Closed</span>
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Right: 3-dot Menu & Chevron */}
                          <div
                            className="flex items-center gap-1 sm:gap-2 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Three Dots Menu Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === shopId ? null : shopId);
                                }}
                                className="p-2 text-[#4F7FB8] hover:text-[#0B2B50] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Shop actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Dropdown Menu */}
                              {activeMenuId === shopId && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#DCEBFF] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedShop(shop);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#0B2B50] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Store className="w-3.5 h-3.5 text-[#4F7FB8]" />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(shop)}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#0B2B50] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#4F7FB8]" />
                                    <span>Edit Shop</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(shop)}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#0B2B50] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00C66B]" />
                                    <span>Mark as {isOpen ? 'Closed' : 'Open'}</span>
                                  </button>
                                  <div className="my-1 border-t border-[#F1F6FD]" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedShop(shop);
                                      setShowDeleteModal(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    <span>Delete Shop</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Chevron Right */}
                            <button
                              type="button"
                              onClick={() => setSelectedShop(shop)}
                              className="p-2 text-[#4F7FB8] hover:text-[#00C66B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Open details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Sidebar Panels (~28% on Desktop)           */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* 1. Add New Shop Card (Reference Soft Green & Dotted Geometry) */}
            <div className="bg-gradient-to-br from-[#E7FBF1] via-[#EDFAF4] to-[#E2F7ED] border border-[#D1F2DE] rounded-3xl p-6 sm:p-7 relative overflow-hidden text-center shadow-xs">
              
              {/* Dotted geometric grid accent in upper-right corner */}
              <div className="absolute top-4 right-4 opacity-40 pointer-events-none" aria-hidden="true">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <pattern id="dot-grid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="1.5" fill="#00C66B" />
                  </pattern>
                  <rect width="60" height="60" fill="url(#dot-grid)" />
                </svg>
              </div>

              {/* Large Green Outlined Store Icon in Circle */}
              <div className="w-16 h-16 rounded-full bg-[#D1F9E3] text-[#00C66B] border border-[#B8F3D1] flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-[#00C66B]" />
              </div>

              {/* Heading & Subtitle */}
              <h2 className="text-xl font-bold text-[#0B2B50]">
                Add New Shop
              </h2>
              <p className="text-xs sm:text-sm text-[#4F7FB8] mt-1.5 mb-6 max-w-xs mx-auto leading-relaxed">
                Register your shop and let more people discover it on ShopNear.
              </p>

              {/* Wide Green Action Button */}
              <button
                type="button"
                onClick={() => navigate('/my-shops/new')}
                className="w-full py-3 px-4 bg-[#00C66B] hover:bg-[#078A4B] text-white font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add Shop</span>
              </button>
            </div>

            {/* 2. Quick Stats Panel */}
            <div className="bg-white rounded-3xl border border-[#DCEBFF] p-6 shadow-xs">
              
              {/* Panel Header */}
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-[#0B2B50]" />
                <h3 className="font-bold text-base text-[#0B2B50]">
                  Quick Stats
                </h3>
              </div>

              {/* Stat Cards Stack */}
              <div className="space-y-3">
                
                {/* Stat 1: Total Shops */}
                <div className="border border-[#DCEBFF] hover:border-[#BFDBFE] rounded-2xl p-3.5 flex items-center justify-between transition-all bg-white group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E7FBF1] text-[#00C66B] flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-[#00C66B]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#4F7FB8] font-medium">Total Shops</div>
                      <div className="text-base font-bold text-[#0B2B50]">{totalShopsCount}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4F7FB8] group-hover:text-[#00C66B] transition-colors" />
                </div>

                {/* Stat 2: Open Shops */}
                <div className="border border-[#DCEBFF] hover:border-[#BFDBFE] rounded-2xl p-3.5 flex items-center justify-between transition-all bg-white group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E7FBF1] text-[#00C66B] flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-[#00C66B]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#4F7FB8] font-medium">Open Shops</div>
                      <div className="text-base font-bold text-[#0B2B50]">{openShopsCount}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4F7FB8] group-hover:text-[#00C66B] transition-colors" />
                </div>

                {/* Stat 3: Closed Shops */}
                <div className="border border-[#DCEBFF] hover:border-[#BFDBFE] rounded-2xl p-3.5 flex items-center justify-between transition-all bg-white group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFE9E9] text-[#EF4444] flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-[#EF4444]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#4F7FB8] font-medium">Closed Shops</div>
                      <div className="text-base font-bold text-[#0B2B50]">{closedShopsCount}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4F7FB8] group-hover:text-red-500 transition-colors" />
                </div>

                {/* Promotional Card: Grow Your Business */}
                <div className="bg-[#E7FBF1] border border-[#D1F2DE] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 mt-4 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#00C66B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-[#00C66B] truncate">
                        Grow Your Business
                      </div>
                      <div className="text-[11px] sm:text-xs text-[#4F7FB8] leading-tight mt-0.5">
                        Keep your shop details updated to attract more local customers.
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4F7FB8] shrink-0" />
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: Add New Shop                                    */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#DCEBFF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F6FD]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E7FBF1] text-[#00C66B]">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0B2B50] text-lg">Register a New Shop</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sharma Sweets"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formData.isOpen ? 'open' : 'closed'}
                    onChange={(e) => setFormData({ ...formData, isOpen: e.target.value === 'open' })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent bg-white"
                  >
                    <option value="open">Open for Business</option>
                    <option value="closed">Temporarily Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#0B2B50]">
                    Location / Address *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00C66B] hover:text-[#078A4B] bg-[#E7FBF1] hover:bg-[#D1F2DE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Compass className="w-3.5 h-3.5" />
                    )}
                    <span>{detectingLocation ? 'Detecting...' : 'Use My GPS Location'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Sadar Bazar, Ghaziabad"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                />

                {/* Interactive Map Preview when coordinates are present */}
                {formData.coordinates && (
                  <div className="mt-2.5">
                    <LeafletMap
                      shopCoords={formData.coordinates}
                      draggable={true}
                      onMarkerDragEnd={handleMapMarkerDrag}
                      shopName={formData.name || 'New Shop'}
                      shopAddress={formData.address}
                      height="150px"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#4F7FB8]">
                      <span>📍 Drag pin to adjust shop entrance</span>
                      <span>
                        {formData.coordinates[1].toFixed(4)}, {formData.coordinates[0].toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    placeholder="e.g. 9:00 AM - 9:00 PM"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Shop Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98111 22334"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                  Shop Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#4F7FB8] hover:text-[#0B2B50] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#00C66B] hover:bg-[#078A4B] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Register Shop</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Edit Existing Shop                              */}
      {/* ======================================================== */}
      {showEditModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#DCEBFF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F6FD]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E7FBF1] text-[#00C66B]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0B2B50] text-lg">Edit Shop Details</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedShop(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShop} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.isOpen ? 'open' : 'closed'}
                    onChange={(e) => setFormData({ ...formData, isOpen: e.target.value === 'open' })}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#0B2B50]">
                    Location / Address *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00C66B] hover:text-[#078A4B] bg-[#E7FBF1] hover:bg-[#D1F2DE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {detectingLocation ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Compass className="w-3.5 h-3.5" />
                    )}
                    <span>{detectingLocation ? 'Detecting...' : 'Use My GPS Location'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                />

                {/* Interactive Map Preview when coordinates are present */}
                {formData.coordinates && (
                  <div className="mt-2.5">
                    <LeafletMap
                      shopCoords={formData.coordinates}
                      draggable={true}
                      onMarkerDragEnd={handleMapMarkerDrag}
                      shopName={formData.name || 'Shop Location'}
                      shopAddress={formData.address}
                      height="150px"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#4F7FB8]">
                      <span>📍 Drag pin to adjust shop entrance</span>
                      <span>
                        {formData.coordinates[1].toFixed(4)}, {formData.coordinates[0].toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B2B50] mb-1.5">
                  Shop Photo URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCEBFF] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedShop(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#4F7FB8] hover:text-[#0B2B50] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#00C66B] hover:bg-[#078A4B] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Delete Shop Confirmation Dialog                 */}
      {/* ======================================================== */}
      {showDeleteModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-[#0B2B50] text-lg">Delete Shop?</h3>
            <p className="text-xs sm:text-sm text-[#4F7FB8] mt-2 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#0B2B50]">{selectedShop.name}</strong>?
              This action cannot be undone and the shop will be removed from ShopNear search results.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedShop(null);
                }}
                className="flex-1 py-2.5 text-xs sm:text-sm font-medium text-[#4F7FB8] hover:text-[#0B2B50] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteShop}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Shop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: Shop Detail Modal                               */}
      {/* ======================================================== */}
      {selectedShop && !showEditModal && !showDeleteModal && (
        <ShopDetailModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
        />
      )}

      {/* Mobile/Tablet Fixed Bottom Navigation (< 1024px) */}
      <BottomNav />
    </div>
  );
}
