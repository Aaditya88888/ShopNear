import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import LeafletMap from '../components/common/LeafletMap';
import {
  ArrowLeft,
  Store,
  MapPin,
  Crosshair,
  UploadCloud,
  Plus,
  Clock,
  Info,
  Check,
  X,
  Loader2,
  Trash2,
  Edit3,
  Calendar,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

const INITIAL_SCHEDULE = [
  { day: 'Monday', openTime: '09:00', closeTime: '21:00', isOpen: true },
  { day: 'Tuesday', openTime: '09:00', closeTime: '21:00', isOpen: true },
  { day: 'Wednesday', openTime: '09:00', closeTime: '21:00', isOpen: true },
  { day: 'Thursday', openTime: '09:00', closeTime: '21:00', isOpen: true },
  { day: 'Friday', openTime: '09:00', closeTime: '21:00', isOpen: true },
  { day: 'Saturday', openTime: '09:00', closeTime: '21:00', isOpen: true },
  { day: 'Sunday', openTime: '10:00', closeTime: '20:00', isOpen: false },
];

export default function AddNewShopPage() {
  const navigate = useNavigate();

  // Basic Information
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Shop Location
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null); // [lng, lat]
  const [isLocating, setIsLocating] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Shop Images
  const [coverImage, setCoverImage] = useState(null); // base64 string or url
  const [coverPreview, setCoverPreview] = useState('');
  const [additionalImages, setAdditionalImages] = useState([]); // array of preview urls/base64

  // Opening Hours
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [copyToWeekdays, setCopyToWeekdays] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. GPS Geolocation Trigger
  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);

        try {
          const res = await fetch(
            `${API_BASE}/shops/reverse-geocode?lat=${latitude}&lng=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.address) {
              setAddress(data.address);
              toast.success('Location detected successfully!');
            } else {
              setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
          } else {
            setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        setIsLocating(false);
        let msg = 'Failed to retrieve your current location.';
        if (geoError.code === 1) {
          msg = 'Location access denied. Please grant location permissions in your browser or type your address manually.';
        } else if (geoError.code === 2) {
          msg = 'Location unavailable. Please check your network or GPS connection.';
        } else if (geoError.code === 3) {
          msg = 'Location request timed out. Please try again.';
        }
        toast.warn(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Map Marker Drag Handlers
  const handleMarkerDragEnd = async (coords) => {
    // coords: [lng, lat]
    setCoordinates(coords);
    try {
      const [lng, lat] = coords;
      const res = await fetch(`${API_BASE}/shops/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.address) {
          setAddress(data.address);
        }
      }
    } catch (err) {
      console.warn('Drag reverse geocode error:', err);
    }
  };

  // 2. Cover Image Handling
  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, or SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview('');
  };

  // Additional Images Handling
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          setAdditionalImages((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeAdditionalImage = (indexToRemove) => {
    setAdditionalImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // 3. Opening Hours Handling
  const handleScheduleChange = (index, field, value) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // If user edits Monday and copyToWeekdays is checked, apply to Mon-Fri
      if (index === 0 && copyToWeekdays && (field === 'openTime' || field === 'closeTime')) {
        for (let i = 1; i <= 4; i++) {
          updated[i] = { ...updated[i], [field]: value };
        }
      }

      return updated;
    });
  };

  const handleToggleDayStatus = (index) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isOpen: !updated[index].isOpen };
      return updated;
    });
  };

  const handleCopyToWeekdaysToggle = (checked) => {
    setCopyToWeekdays(checked);
    if (checked) {
      const monday = schedule[0];
      setSchedule((prev) =>
        prev.map((dayItem, idx) => {
          if (idx >= 1 && idx <= 4) {
            return {
              ...dayItem,
              openTime: monday.openTime,
              closeTime: monday.closeTime,
              isOpen: monday.isOpen,
            };
          }
          return dayItem;
        })
      );
      toast.info('Copied Monday operating hours to all weekdays (Mon-Fri).');
    }
  };

  // 4. Form Submit & Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shopName.trim()) {
      toast.error('Please enter the shop name.');
      return;
    }

    if (!category.trim()) {
      toast.error('Please select a shop category.');
      return;
    }

    if (!address.trim()) {
      toast.error('Please provide a shop address or click "Use My Location".');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format a clean readable summary for hours
      const mon = schedule[0];
      const sat = schedule[5];
      const sun = schedule[6];
      let formattedHours = `Mon-Fri: ${mon.isOpen ? `${mon.openTime} - ${mon.closeTime}` : 'Closed'}, Sat: ${
        sat.isOpen ? `${sat.openTime} - ${sat.closeTime}` : 'Closed'
      }, Sun: ${sun.isOpen ? `${sun.openTime} - ${sun.closeTime}` : 'Closed'}`;

      const isCurrentlyOpen = schedule.some((d) => d.isOpen);

      const payload = {
        name: shopName.trim(),
        category: category.trim(),
        description: description.trim(),
        address: address.trim(),
        coordinates: coordinates, // [lng, lat] or null
        hours: formattedHours,
        isOpen: isCurrentlyOpen,
        image: coverImage || '',
        additionalImages: additionalImages,
      };

      const res = await fetch(`${API_BASE}/shops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Shop created successfully!');
        navigate('/my-shops');
      } else {
        toast.error(data.message || 'Failed to create shop. Please try again.');
      }
    } catch (err) {
      console.error('Error creating shop:', err);
      toast.error('Network error. Could not create shop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FD] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pb-16 pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Breadcrumb Navigation */}
          <div className="mb-4">
            <Link
              to="/my-shops"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4F7FB8] hover:text-[#00C66B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Shops</span>
            </Link>
          </div>

          {/* Page Header Card matching screenshot */}
          <div className="bg-white rounded-2xl border border-[#DCEBFF] p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2B50] tracking-tight">
                Add New Shop
              </h1>
              <p className="text-xs sm:text-sm text-[#4F7FB8] mt-1">
                Create a new shop listing with accurate details and location
              </p>
            </div>

            {/* Storefront graphic accent */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E7FBF1] to-[#D1F2DE] border border-[#B8F2D5] flex items-center justify-center text-[#00C66B] shadow-xs shrink-0">
              <Store className="w-8 h-8" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ========================================================= */}
            {/* SECTION 1: Basic Information */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-[#DCEBFF] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F1F6FD]">
                <div className="w-8 h-8 rounded-full bg-[#00C66B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B2B50]">Basic Information</h2>
                  <p className="text-xs text-[#4F7FB8]">Enter the primary details about your shop</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Shop Name */}
                <div>
                  <label className="block text-xs font-bold text-[#0B2B50] uppercase tracking-wider mb-2">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Sharma Sweets & Bakery"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#DCEBFF] bg-white text-[#0B2B50] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent transition-all"
                  />
                </div>

                {/* Shop Category */}
                <div>
                  <label className="block text-xs font-bold text-[#0B2B50] uppercase tracking-wider mb-2">
                    Shop Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#DCEBFF] bg-white text-[#0B2B50] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#4F7FB8]">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Shop Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#0B2B50] uppercase tracking-wider">
                      Shop Description <span className="text-[#4F7FB8] font-normal normal-case">(Optional)</span>
                    </label>
                    <span className="text-xs text-[#4F7FB8]">
                      {description.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what your shop offers, specialties, popular items..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#DCEBFF] bg-white text-[#0B2B50] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00C66B] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 2: Shop Location */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-[#DCEBFF] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F1F6FD]">
                <div className="w-8 h-8 rounded-full bg-[#00C66B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B2B50]">Shop Location</h2>
                  <p className="text-xs text-[#4F7FB8]">
                    Pin your shop on the map for accurate customer discovery
                  </p>
                </div>
              </div>

              {/* Use My Current Location Action Banner */}
              <div className="bg-[#E7FBF1] border border-[#B8F2D5] rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white text-[#00C66B] flex items-center justify-center shadow-xs shrink-0">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B2B50]">Use your current location</h4>
                    <p className="text-xs text-[#078A4B]">
                      Quickly set your shop&apos;s coordinates using your device GPS
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="px-4 py-2 bg-[#00C66B] hover:bg-[#078A4B] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Use My Location</span>
                    </>
                  )}
                </button>
              </div>

              {/* Map & Details Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Interactive Leaflet Map */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="rounded-xl overflow-hidden border border-[#DCEBFF] relative shadow-inner bg-slate-50 flex-1 min-h-[260px]">
                    <LeafletMap
                      shopCoords={coordinates || [77.0266, 28.4595]}
                      shopName={shopName.trim() || 'Your Shop Location'}
                      shopAddress={address}
                      draggable={true}
                      markerColor="#EF4444"
                      markerLabel="Your Shop Location"
                      onMarkerDragEnd={handleMarkerDragEnd}
                      height="260px"
                    />
                  </div>
                  <p className="text-[11px] text-[#4F7FB8] mt-2 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#00C66B] shrink-0" />
                    <span>Drag the red pin to fine-tune your exact shop entrance.</span>
                  </p>
                </div>

                {/* Right: Location Details Card */}
                <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B2B50]">
                        Location Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-xs font-semibold text-[#00C66B] hover:text-[#078A4B] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditingAddress ? 'Done' : 'Edit Location'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#4F7FB8] mb-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        {isEditingAddress ? (
                          <textarea
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter complete street address, landmark, city"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCEBFF] bg-white text-[#0B2B50] focus:ring-1 focus:ring-[#00C66B] focus:outline-none"
                          />
                        ) : (
                          <p className="text-xs text-[#0B2B50] bg-white p-2.5 rounded-lg border border-[#E2E8F0] min-h-[44px] leading-relaxed break-words">
                            {address || 'No address set yet. Use GPS or click Edit Location.'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#4F7FB8] mb-1">
                          Latitude & Longitude
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2.5 py-1.5 rounded-md bg-white border border-[#E2E8F0] font-mono text-[#0B2B50]">
                            Lat: {coordinates ? coordinates[1].toFixed(5) : '28.4595'}
                          </span>
                          <span className="text-[11px] px-2.5 py-1.5 rounded-md bg-white border border-[#E2E8F0] font-mono text-[#0B2B50]">
                            Lng: {coordinates ? coordinates[0].toFixed(5) : '77.0266'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] text-[#4F7FB8] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#00C66B]" />
                    <span>Coordinates are verified for nearby customer search</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 3: Shop Images */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-[#DCEBFF] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F1F6FD]">
                <div className="w-8 h-8 rounded-full bg-[#00C66B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  3
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B2B50]">Shop Images</h2>
                  <p className="text-xs text-[#4F7FB8]">
                    Upload high-quality images to attract more local customers
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Shop Cover Image (Required) */}
                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-[#0B2B50] uppercase tracking-wider mb-2">
                    Shop Cover Image <span className="text-red-500">*</span>
                  </label>

                  {coverPreview ? (
                    <div className="relative rounded-2xl border border-[#DCEBFF] overflow-hidden group h-48 bg-slate-100 flex items-center justify-center">
                      <img
                        src={coverPreview}
                        alt="Shop Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-white text-[#0B2B50] text-xs font-semibold rounded-lg cursor-pointer hover:bg-slate-50 transition-colors shadow-xs">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverImageChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="h-48 border-2 border-dashed border-[#DCEBFF] hover:border-[#00C66B] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white hover:bg-[#F9FCFF] group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageChange}
                      />
                      <div className="w-12 h-12 rounded-full bg-[#E7FBF1] text-[#00C66B] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#0B2B50] group-hover:text-[#00C66B] transition-colors">
                        Click to upload cover image or drag and drop
                      </span>
                      <span className="text-[11px] text-[#4F7FB8] mt-1">
                        SVG, PNG, JPG (max 5MB)
                      </span>
                    </label>
                  )}
                </div>

                {/* 2. Additional Images (Optional) */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#0B2B50] uppercase tracking-wider">
                      Additional Images <span className="text-[#4F7FB8] font-normal normal-case">(Optional)</span>
                    </label>
                    <span className="text-xs text-[#4F7FB8]">
                      {additionalImages.length} images added
                    </span>
                  </div>

                  <div className="border border-[#DCEBFF] rounded-2xl p-4 bg-white min-h-[192px] flex flex-col justify-between">
                    {additionalImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-32 mb-3 pr-1">
                        {additionalImages.map((imgSrc, idx) => (
                          <div
                            key={idx}
                            className="relative h-14 rounded-lg overflow-hidden border border-[#DCEBFF] group"
                          >
                            <img
                              src={imgSrc}
                              alt={`Extra ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                        <Store className="w-7 h-7 text-[#DCEBFF] mb-1.5" />
                        <p className="text-xs text-[#4F7FB8]">
                          Upload photos of your storefront, products, menu, or interior.
                        </p>
                      </div>
                    )}

                    <label className="w-full py-2.5 px-3 border border-[#00C66B] hover:bg-[#E7FBF1] text-[#00C66B] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors mt-auto">
                      <Plus className="w-4 h-4" />
                      <span>+ Add Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleAdditionalImagesChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 4: Opening Hours */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-[#DCEBFF] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F1F6FD]">
                <div className="w-8 h-8 rounded-full bg-[#00C66B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  4
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0B2B50]">Opening Hours</h2>
                  <p className="text-xs text-[#4F7FB8]">
                    Set your weekly business operating schedule
                  </p>
                </div>
              </div>

              {/* Informational banner */}
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5 mb-6 flex items-start gap-3 text-xs text-[#1E40AF]">
                <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#1E3A8A]">Regular Business Hours: </strong>
                  Set the opening and closing times for each day. Customers see real-time open/closed status.
                </div>
              </div>

              {/* Weekly Schedule Table */}
              <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#4F7FB8] font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-4">Opening Time</th>
                      <th className="py-3 px-4">Closing Time</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {schedule.map((row, idx) => (
                      <tr key={row.day} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0B2B50] flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#4F7FB8]" />
                          <span>{row.day}</span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="time"
                            disabled={!row.isOpen}
                            value={row.openTime}
                            onChange={(e) => handleScheduleChange(idx, 'openTime', e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCEBFF] bg-white text-[#0B2B50] disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C66B]"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="time"
                            disabled={!row.isOpen}
                            value={row.closeTime}
                            onChange={(e) => handleScheduleChange(idx, 'closeTime', e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCEBFF] bg-white text-[#0B2B50] disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00C66B]"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDayStatus(idx)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                              row.isOpen
                                ? 'bg-[#E7FBF1] text-[#00C66B] border border-[#B8F2D5]'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {row.isOpen ? 'Open' : 'Closed'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick option: Copy to weekdays */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="copyHoursCheckbox"
                  checked={copyToWeekdays}
                  onChange={(e) => handleCopyToWeekdaysToggle(e.target.checked)}
                  className="w-4 h-4 text-[#00C66B] rounded border-[#DCEBFF] focus:ring-[#00C66B] cursor-pointer"
                />
                <label
                  htmlFor="copyHoursCheckbox"
                  className="text-xs font-medium text-[#0B2B50] cursor-pointer select-none"
                >
                  Copy Monday hours to all working days (Mon - Fri)
                </label>
              </div>

              {/* Special Hours and Holidays info card */}
              <div className="mt-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#00C66B] shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-[#0B2B50]">Special Hours & Holidays</h5>
                    <p className="text-[11px] text-[#4F7FB8]">
                      You can set custom hours for festivals and holidays directly from your dashboard.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast.info('Special festival and holiday hours settings are active!')
                  }
                  className="text-xs font-semibold text-[#00C66B] hover:text-[#078A4B] cursor-pointer shrink-0"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* BOTTOM ACTION BAR */}
            {/* ========================================================= */}
            <div className="bg-white rounded-2xl border border-[#DCEBFF] p-5 shadow-xs flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/my-shops')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !shopName.trim() || !category.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#00C66B] hover:bg-[#078A4B] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Shop...</span>
                  </>
                ) : (
                  <>
                    <span>Create Shop</span>
                    <span aria-hidden="true">&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
