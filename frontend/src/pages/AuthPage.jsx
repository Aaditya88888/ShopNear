import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

export default function AuthPage({ mode: initialMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active mode from URL (/signup vs /login)
  const isSignUp = location.pathname === '/signup' || initialMode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleTabSwitch = (targetMode) => {
    setSubmitted(false);
    if (targetMode === 'login') {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EFF9F5] via-[#F4FBF7] to-[#F8FAFC] flex flex-col justify-between selection:bg-[#16A34A] selection:text-white relative overflow-x-hidden">
      {/* Decorative ambient subtle background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#DCFCE7]/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#E0F2FE]/40 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between min-w-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg"
        >
          <BrandLogo showTagline={false} size="small" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#64748B] hover:text-[#16A34A] transition-colors cursor-pointer py-1.5 px-2.5 sm:px-3 rounded-xl hover:bg-white/80 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3.5 sm:px-4 py-6 sm:py-12 w-full min-w-0">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#E2E8F0] shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-5 sm:p-10 transition-all duration-200 min-w-0">
          {/* Top Pill Tab Switcher */}
          <div className="w-full bg-[#EBF8F2] p-1.5 rounded-2xl flex items-center mb-7">
            <button
              type="button"
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                !isSignUp
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#16A34A] hover:text-[#0F7A44]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                isSignUp
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'text-[#16A34A] hover:text-[#0F7A44]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {submitted ? (
            /* Prototype Confirmation Message */
            <div className="py-8 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-[#DCFCE7]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A]">
                {!isSignUp ? 'Welcome Back!' : 'Account Created Successfully!'}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#64748B] max-w-xs mx-auto leading-relaxed">
                You entered <span className="font-semibold text-[#0F172A]">{email}</span>. This is a frontend prototype. Real authentication & session storage will connect to the backend in Phase 2.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Explore Nearby Shops
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Edit details
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form Header */}
              <div className="space-y-2 mb-6">
                <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F172A] tracking-tight leading-snug">
                  {!isSignUp ? 'Welcome Back' : 'Create an Account'}
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {!isSignUp
                    ? 'Sign in to your account to continue exploring local shops and services.'
                    : 'Sign up to discover nearby shops, save your favorites, and more.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Email Address Field */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#0F172A] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center w-full min-w-0">
                    <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full min-w-0 pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all"
                    />
                  </div>
                </div>

                {/* 2. Password Field */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#0F172A] mb-1.5">
                    Password
                  </label>
                  <div className="relative flex items-center w-full min-w-0">
                    <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full min-w-0 pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Auxiliary Row (Remember Me & Forgot Password) */}
                {!isSignUp ? (
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-xs sm:text-[13px]">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[#64748B] shrink-0">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-md border-[#CBD5E1] text-[#16A34A] focus:ring-[#16A34A] accent-[#16A34A] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert('Password reset will be available with backend integration.')}
                      className="font-medium text-[#16A34A] hover:underline cursor-pointer shrink-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <div className="pt-0.5 text-xs text-[#64748B] leading-relaxed">
                    By signing up, you agree to ShopNear's Terms of Service and Privacy Policy.
                  </div>
                )}

                {/* 4. Primary Solid Green Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-3.5 bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2"
                  >
                    {!isSignUp ? 'Log In' : 'Sign Up'}
                  </button>
                </div>
              </form>

              {/* 5. OR Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-[#E2E8F0]" />
                <span className="flex-shrink mx-4 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase">
                  OR
                </span>
                <div className="flex-grow border-t border-[#E2E8F0]" />
              </div>

              {/* 6. Continue with Google SSO Button */}
              <button
                type="button"
                onClick={() => alert('Google Sign-In will be connected with OAuth in Phase 2.')}
                className="w-full py-2.5 sm:py-3 bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs sm:text-sm font-semibold text-[#0F172A] transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
              >
                {/* Official 4-Color Google G Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* 7. Bottom Navigation Switch */}
              <div className="text-center pt-6 text-xs sm:text-[13px] text-[#64748B]">
                {!isSignUp ? (
                  <p>
                    New to ShopNear?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('signup')}
                      className="font-semibold text-[#16A34A] hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleTabSwitch('login')}
                      className="font-semibold text-[#16A34A] hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-[#64748B] px-4 w-full max-w-sm mx-auto">
        <p className="leading-relaxed">© 2026 ShopNear. Empowering local businesses & everyday convenience.</p>
      </footer>
    </div>
  );
}
