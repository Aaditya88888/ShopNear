import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Store,
  Tag,
  MoreVertical,
  ChevronRight,
  Zap,
  Heart,
  Star,
  Settings,
  Trash2,
  ShieldCheck,
  Shield,
  Edit2,
  Plus,
  X,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  Download,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ShopDetailModal from '../components/common/ShopDetailModal';
import BottomNav from '../components/layout/BottomNav';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, removeAvatar, changePassword, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  // Modals
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showInstallAppModal, setShowInstallAppModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    bio: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete Account Confirmation
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync user details to edit form
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  // Fetch User's Shops
  useEffect(() => {
    async function fetchUserShops() {
      try {
        const res = await fetch(`${API_BASE}/shops/my-shops`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.shops)) {
            setShops(data.shops);
          }
        }
      } catch (err) {
        console.error('Error fetching user shops:', err);
      } finally {
        setLoadingShops(false);
      }
    }

    fetchUserShops();
  }, []);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowImagePreview(false);
      }
    }
    if (showImagePreview) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImagePreview]);

  // Avatar File Change Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB.');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Optimizing and uploading to Cloudinary...');
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        toast.update(toastId, {
          render: 'Profile picture updated successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: result.message || 'Failed to upload profile picture.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render: 'Error uploading profile picture.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Avatar Removal Handler
  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    const toastId = toast.loading('Removing profile photo from Cloudinary...');
    try {
      const result = await removeAvatar();
      if (result.success) {
        toast.update(toastId, {
          render: 'Profile photo removed successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: result.message || 'Failed to remove profile photo.',
          type: 'error',
          isLoading: false,
          autoClose: 4000,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render: 'Error removing profile photo.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setRemovingAvatar(false);
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setShowEditProfileModal(false);
      } else {
        toast.error(result.message || 'Failed to update profile.');
      }
    } catch (err) {
      toast.error('Network error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      if (result.success) {
        toast.success('Password changed successfully!');
        setShowChangePasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message || 'Failed to change password.');
      }
    } catch (err) {
      toast.error('Network error changing password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type "DELETE" exactly to confirm.');
      return;
    }

    setDeletingAccount(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.info('Your account has been permanently deleted.');
        navigate('/');
      } else {
        toast.error(result.message || 'Failed to delete account.');
      }
    } catch (err) {
      toast.error('Network error while deleting account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been logged out.');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out. Please try again.');
    }
  };

  // Install PWA Trigger
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Thank you for installing ShopNear!');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallAppModal(true);
    }
  };

  // Display values with graceful fallback
  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'User');
  const displayBio = user?.bio?.trim() || '';
  const isUserVerified = Boolean(user?.isVerified);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] selection:bg-[#16A34A] selection:text-white">
      {/* Top Authenticated Navbar */}
      <Navbar activeTab="profile" />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Profile Header Card & My Shops (lg:col-span-8) */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. Profile Header Card */}
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#D1F2DE] bg-gradient-to-br from-[#E8F8EE] via-[#EDFAF2] to-[#E2F6EA] p-6 sm:p-8 shadow-xs">
              
              {/* Subtle Layered Mint Geometric Shapes in Background (Matching Screenshot) */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden"
                aria-hidden="true"
              >
                <div className="absolute -top-12 -right-12 w-96 h-96 bg-gradient-to-br from-[#86EFAC]/25 to-transparent rounded-full blur-2xl transform rotate-12" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-[#BBF7D0]/30 to-transparent rounded-3xl transform rotate-45" />
                <div className="absolute top-1/2 -left-16 w-64 h-64 bg-gradient-to-tr from-[#DCFCE7]/40 to-transparent rounded-full blur-xl" />
              </div>

              {/* Upper-Right: Verified Account Badge */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
                {isUserVerified ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-xs border border-[#16A34A] text-[#16A34A] rounded-full text-xs font-semibold shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Verified Account</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-xs border border-slate-300 text-slate-500 rounded-full text-xs font-medium">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Standard Account</span>
                  </div>
                )}
              </div>

              {/* Profile Card Body */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
                
                {/* Circular Profile Avatar (Opens Lightbox Preview on click if photo exists) */}
                <div className="relative shrink-0">
                  <div
                    onClick={() => {
                      if (user?.avatar) {
                        setShowImagePreview(true);
                      }
                    }}
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center select-none ${
                      user?.avatar
                        ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-transform'
                        : ''
                    }`}
                    title={user?.avatar ? 'Click to view full photo' : ''}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#DCFCE7] text-[#16A34A] font-bold text-3xl sm:text-4xl uppercase select-none">
                        {displayName[0]}
                      </div>
                    )}
                    {(uploadingAvatar || removingAvatar) && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  {/* Hidden File Input for Native Picker (Triggered via Edit Profile Modal) */}
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploadingAvatar || removingAvatar}
                  />
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
                  
                  {/* Name & Verification Badge */}
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                      {displayName}
                    </h1>
                    {isUserVerified && (
                      <span className="text-[#16A34A]" title="Verified Account">
                        <CheckCircle2 className="w-5 h-5 fill-[#16A34A] text-white" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowEditProfileModal(true)}
                      className="p-1 rounded-full text-[#64748B] hover:text-[#16A34A] hover:bg-white/60 transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* User Registered Email (Read-only) */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#475569] mt-1 justify-center sm:justify-start">
                    <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                    <span>{user?.email}</span>
                  </div>

                  {/* Bio */}
                  {displayBio ? (
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed mt-2.5 max-w-xl">
                      {displayBio}
                    </p>
                  ) : (
                    <p className="text-xs text-[#94A3B8] italic mt-2.5 flex items-center gap-1.5">
                      <span>No bio added yet.</span>
                      <button
                        type="button"
                        onClick={() => setShowEditProfileModal(true)}
                        className="text-[#16A34A] hover:underline font-medium not-italic cursor-pointer"
                      >
                        Add bio
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. My Shops Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 shadow-xs">
              
              {/* Header with Title and Shop Count Pill */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7]/60 text-[#16A34A] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">My Shops</h2>
                    <p className="text-xs sm:text-sm text-[#64748B]">
                      Shops you&apos;ve added to ShopNear
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center px-3 py-1 bg-[#DCFCE7] text-[#16A34A] rounded-full text-xs font-semibold shrink-0">
                  {shops.length} {shops.length === 1 ? 'Shop' : 'Shops'}
                </div>
              </div>

              {/* Shop List */}
              <div className="mt-5 space-y-3.5">
                {loadingShops ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center justify-between p-4 border border-[#E2E8F0] rounded-2xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 rounded-xl" />
                          <div className="space-y-2">
                            <div className="w-32 h-4 bg-slate-100 rounded" />
                            <div className="w-24 h-3 bg-slate-100 rounded" />
                            <div className="w-36 h-3 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : shops.length === 0 ? (
                  /* Clean Empty State */
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mx-auto mb-3 border border-[#DCFCE7]">
                      <Store className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-[#0F172A] text-sm sm:text-base">
                      No shops registered yet
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-sm mx-auto">
                      You haven&apos;t added any shops to your account yet. Add a shop now to make it visible to local customers.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/my-shops')}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register a New Shop</span>
                    </button>
                  </div>
                ) : (
                  shops.map((shop) => (
                    <div
                      key={shop._id || shop.id}
                      onClick={() => setSelectedShop(shop)}
                      className="group border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-white transition-all hover:shadow-xs cursor-pointer"
                    >
                      {/* Left: Thumbnail & Shop Details */}
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        {/* Thumbnail with small corner shop badge */}
                        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-[#E2E8F0]">
                          <img
                            src={
                              shop.image ||
                              'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&auto=format&fit=crop&q=80'
                            }
                            alt={shop.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white text-[#16A34A] border border-[#DCFCE7] flex items-center justify-center shadow-2xs">
                            <Store className="w-3 h-3 text-[#16A34A]" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#0F172A] text-sm sm:text-base truncate group-hover:text-[#16A34A] transition-colors">
                            {shop.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                            <Tag className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                            <span className="truncate">{shop.category}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                            <span className="truncate">{shop.address}</span>
                          </div>
                          <div className="mt-1.5">
                            {shop.isOpen !== false ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                                <span>Open</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Closed</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Three Dots Menu & Chevron */}
                      <div
                        className="flex items-center gap-1 sm:gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedShop(shop)}
                          className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Shop Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedShop(shop)}
                          className="p-2 text-[#94A3B8] hover:text-[#16A34A] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Quick Actions & Account Security (lg:col-span-4) */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-6 shadow-xs">
              
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-base font-bold text-[#0F172A]">Quick Actions</h2>
              </div>

              {/* 5 Actions in Exact Specified Order */}
              <div className="space-y-3">
                
                {/* 1. My Shops */}
                <button
                  type="button"
                  onClick={() => navigate('/my-shops')}
                  className="w-full text-left border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/60 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-[#16A34A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#16A34A] transition-colors truncate">
                        My Shops
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        Manage your added shops
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* 2. Favourites */}
                <button
                  type="button"
                  onClick={() => navigate('/favourites')}
                  className="w-full text-left border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/60 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F0FDF4] text-[#0F172A] flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 text-[#0F172A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#16A34A] transition-colors truncate">
                        Favourites
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        View your liked shops
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* 3. Install App */}
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full text-left border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/60 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-[#16A34A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#16A34A] transition-colors truncate">
                        Install App
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        Add ShopNear to your home screen
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* 4. Change Password */}
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  className="w-full text-left border border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-slate-50/60 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center shrink-0">
                      <Settings className="w-5 h-5 text-[#0F172A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#16A34A] transition-colors truncate">
                        Change Password
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        Keep your account secure
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* 5. Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left border border-[#E2E8F0] hover:border-[#16A34A] hover:bg-[#F0FDF4]/60 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E7FBF1] text-[#16A34A] flex items-center justify-center shrink-0">
                      <LogOut className="w-5 h-5 text-[#16A34A]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#0F172A] group-hover:text-[#16A34A] transition-colors truncate">
                        Logout
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        Sign out of your account
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

                {/* 6. Delete Account */}
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="w-full text-left border border-red-100 hover:border-red-200 hover:bg-red-50/40 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#EF4444] flex items-center justify-center shrink-0">
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-[#EF4444] truncate">
                        Delete Account
                      </div>
                      <div className="text-xs text-[#64748B] truncate">
                        Permanently delete your account
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-[#EF4444] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>

              </div>
            </div>

            {/* Account Security Card */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl sm:rounded-3xl p-5 flex items-start gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-[#16A34A]">Your account is secure</h3>
                <p className="text-xs text-[#15803D]/80 mt-0.5 leading-relaxed">
                  We keep your information safe and private.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: Edit Profile Details                            */}
      {/* ======================================================== */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#16A34A]" />
                <h3 className="font-bold text-[#0F172A] text-lg">Edit Profile Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Avatar Management Row in Edit Profile Modal */}
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-xs overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#DCFCE7] text-[#16A34A] font-bold text-lg uppercase">
                      {displayName[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">Profile Picture</div>
                  <div className="text-[11px] text-[#64748B]">
                    {user?.avatar ? 'Custom image uploaded' : 'No photo uploaded'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-file-input')?.click()}
                  disabled={uploadingAvatar || removingAvatar}
                  className="px-3 py-1.5 text-xs font-semibold text-[#16A34A] bg-white border border-[#16A34A] hover:bg-[#F0FDF4] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Change
                </button>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar || removingAvatar}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#0F172A]">
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Read-only</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    tabIndex={-1}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100/80 text-slate-600 font-medium cursor-not-allowed select-none pl-9"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Your account email is permanent and cannot be changed.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Write a short bio about yourself..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#0F7A44] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Change Password                                 */}
      {/* ======================================================== */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#16A34A]" />
                <h3 className="font-bold text-[#0F172A] text-lg">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#16A34A] hover:bg-[#0F7A44] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Delete Account Confirmation                     */}
      {/* ======================================================== */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-[#0F172A] text-lg text-center">
              Delete Account Permanently?
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] text-center mt-2 leading-relaxed">
              This action is permanent and cannot be undone. All your registered shops, profile
              data, and activity history will be deleted immediately.
            </p>

            <div className="mt-5 p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700">
              <span className="font-semibold">Confirmation required:</span> Type{' '}
              <strong className="tracking-wider">DELETE</strong> in the field below to confirm.
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold tracking-wider"
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeleteConfirmationText('');
                }}
                className="flex-1 py-2.5 text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE' || deletingAccount}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-xl transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
              >
                {deletingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: Install PWA Guide                               */}
      {/* ======================================================== */}
      {showInstallAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#16A34A]" />
                <h3 className="font-bold text-[#0F172A] text-lg">Install ShopNear</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallAppModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
              <p>
                You can install ShopNear as a native web app directly onto your home screen or desktop:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <strong className="text-[#0F172A]">Chrome / Edge (Desktop & Android):</strong>
                  <p className="text-xs text-[#64748B]">
                    Click the install icon in the URL address bar or select &ldquo;Install ShopNear&rdquo; from the browser menu.
                  </p>
                </div>
                <div>
                  <strong className="text-[#0F172A]">Safari (iOS):</strong>
                  <p className="text-xs text-[#64748B]">
                    Tap the Share button (<span className="font-mono">⎋</span>) in Safari and choose &ldquo;Add to Home Screen&rdquo;.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstallAppModal(false)}
                className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: Shop Detail Modal                               */}
      {/* ======================================================== */}
      {selectedShop && (
        <ShopDetailModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 6: Full-Size Profile Image Lightbox Preview        */}
      {/* ======================================================== */}
      {showImagePreview && user?.avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 ease-out"
          onClick={() => setShowImagePreview(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowImagePreview(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-white z-10"
            aria-label="Close image preview"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Lightbox Image Card - WhatsApp Fluid Momentum Expansion */}
          <div
            className="relative max-w-sm sm:max-w-md w-full aspect-square rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/40 select-none animate-whatsapp-expand"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={user.avatar}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Mobile/Tablet Fixed Bottom Navigation (< 1024px) */}
      <BottomNav />
    </div>
  );
}
