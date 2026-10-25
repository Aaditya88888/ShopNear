import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { LogOut, Home, Store, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function Navbar({ onNavigate, activeTab: propActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  // Determine active tab either from props or current URL pathname
  const currentPath = location.pathname;
  let activeTab = propActiveTab;
  if (!activeTab) {
    if (currentPath === '/') activeTab = 'home';
    else if (currentPath === '/my-shops') activeTab = 'my-shops';
    else if (currentPath === '/favourites' || currentPath === '/favorites') activeTab = 'favourites';
    else if (currentPath === '/profile') activeTab = 'profile';
    else activeTab = '';
  }

  // Authenticated navigation items
  const authenticatedNavItems = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'my-shops', label: 'My Shops', path: '/my-shops', icon: Store },
    { id: 'favourites', label: 'Favourites', path: '/favourites', icon: Heart },
    { id: 'profile', label: 'Profile', path: '/profile', icon: User },
  ];

  const handleNavClick = (item) => {
    if (item.path === '/' && currentPath === '/' && onNavigate) {
      onNavigate('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(item.path);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('You have been logged out.');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between w-full">
        {/* Left: Brand Identity (Always visible) */}
        <button
          type="button"
          onClick={() => {
            if (currentPath === '/' && onNavigate) {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
          className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg cursor-pointer"
          aria-label="ShopNear Home"
        >
          <BrandLogo />
        </button>

        {/* Center: Navigation Links (Rendered ONLY on desktop when user is authenticated) */}
        {user ? (
          <nav className="hidden lg:flex items-center space-x-2 lg:space-x-6" aria-label="Authenticated Navigation">
            {authenticatedNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`relative flex items-center gap-2 px-3 py-5 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-sm ${
                    isActive
                      ? 'text-[#16A34A] font-semibold'
                      : 'text-[#0F172A] hover:text-[#16A34A]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16A34A]' : 'text-[#0F172A]'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#16A34A] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          /* Empty spacer to maintain flex alignment on unauthenticated desktop views */
          <div className="hidden lg:block" />
        )}

        {/* Right Section: Desktop ONLY (>= 1024px) - Hidden on Mobile/Tablet where BottomNav is used */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* While initial session check is loading, display subtle placeholder */}
          {loading ? (
            <div className="flex items-center space-x-2 animate-pulse" aria-hidden="true">
              <div className="w-20 h-9 bg-slate-100 rounded-xl" />
            </div>
          ) : user ? (
            /* Desktop Authenticated: Logout Button */
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-[#16A34A] bg-transparent hover:bg-[#F0FDF4] border border-[#16A34A] rounded-xl transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
              title="Sign out of ShopNear"
            >
              <LogOut className="w-4 h-4 text-[#16A34A]" />
              <span>Logout</span>
            </button>
          ) : (
            /* Desktop Unauthenticated: Login & Sign Up */
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-5 py-2 text-sm font-medium text-[#16A34A] bg-white border border-[#E2E8F0] rounded-[10px] hover:border-[#16A34A] hover:bg-[#F0FDF4] active:bg-[#DCFCE7] transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-5 py-2 text-sm font-medium text-white bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] rounded-[10px] transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-1"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
