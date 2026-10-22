import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function Navbar({ onNavigate, activeTab = 'home' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'Categories' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      navigate('/');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out.');
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between w-full">
        {/* Left: Brand Identity */}
        <button
          type="button"
          onClick={() => {
            navigate('/');
            if (onNavigate) onNavigate('home');
          }}
          className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg cursor-pointer"
        >
          <BrandLogo />
        </button>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-md ${
                  isActive
                    ? 'text-[#16A34A] font-semibold'
                    : 'text-[#0F172A] hover:text-[#16A34A]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#16A34A] rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Auth State (Desktop) */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* User Identity Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl text-xs font-medium text-[#0F172A]">
                <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-[11px] uppercase">
                  {user.email ? user.email[0] : 'U'}
                </div>
                <span className="max-w-[140px] truncate text-[#0F172A] font-semibold">
                  {user.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#64748B] hover:text-red-600 bg-white border border-[#E2E8F0] hover:border-red-200 rounded-[10px] transition-all cursor-pointer shadow-xs"
                title="Sign out of ShopNear"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 text-sm font-medium text-[#16A34A] bg-white border border-[#E2E8F0] rounded-[10px] hover:border-[#16A34A] hover:bg-[#F0FDF4] active:bg-[#DCFCE7] transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A]"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2 text-sm font-medium text-white bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] rounded-[10px] transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-1"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0F172A] hover:text-[#16A34A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                    isActive
                      ? 'bg-[#F0FDF4] text-[#16A34A] font-semibold'
                      : 'text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-[#F0FDF4] rounded-lg flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#16A34A]" />
                  <span className="text-xs font-semibold text-[#0F172A] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-sm font-medium text-red-600 bg-white border border-red-200 rounded-[10px] hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-[#16A34A] bg-white border border-[#E2E8F0] rounded-[10px] hover:border-[#16A34A] hover:bg-[#F0FDF4]"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-white bg-[#16A34A] hover:bg-[#0F7A44] rounded-[10px] shadow-xs"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
