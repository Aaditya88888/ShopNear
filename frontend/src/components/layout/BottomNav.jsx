import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Store, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const currentPath = location.pathname;

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: Home,
      isActive: currentPath === '/',
    },
    {
      id: 'my-shops',
      label: 'My Shops',
      path: '/my-shops',
      icon: Store,
      isActive: currentPath.startsWith('/my-shops') || currentPath === '/add-shop',
    },
    {
      id: 'favourites',
      label: 'Favourites',
      path: '/favourites',
      icon: Heart,
      isActive: currentPath === '/favourites' || currentPath === '/favorites',
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: User,
      isActive: currentPath === '/profile',
    },
  ];

  const handleTabClick = (item) => {
    if (item.path === '/' && currentPath === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If protected route and user not logged in, navigate to login with return redirect
    if ((item.id === 'my-shops' || item.id === 'favourites' || item.id === 'profile') && !user) {
      navigate('/login');
      return;
    }

    navigate(item.path);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-[0_-2px_12px_rgba(0,0,0,0.04)] lg:hidden pb-safe"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item)}
              aria-label={item.label}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-colors group focus:outline-none cursor-pointer"
            >
              <div className="relative flex flex-col items-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 group-active:scale-90 ${
                    isActive ? 'text-[#16A34A] stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[11px] mt-1 transition-colors leading-none tracking-tight ${
                    isActive ? 'text-[#16A34A] font-semibold' : 'text-[#64748B] font-medium'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Indicator Underline Pill */}
                {isActive ? (
                  <span className="w-7 h-[2.5px] bg-[#16A34A] rounded-full mt-1 animate-in fade-in zoom-in-90 duration-150" />
                ) : (
                  <span className="w-7 h-[2.5px] bg-transparent mt-1" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
