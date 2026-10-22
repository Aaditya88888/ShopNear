import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  RotateCw,
  AlertCircle,
  Clock,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function AuthPage({ mode: initialMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    authError,
    setAuthError,
    signupStep,
    signupEmail,
    initiateSignup,
    verifySignupOtp,
    resendSignupOtp,
    login,
    resetSignupStep,
  } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Determine active mode from URL (/signup vs /login)
  const isSignUp = location.pathname === '/signup' || initialMode === 'signup';

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification State
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(30); // 30s cooldown
  const [canResend, setCanResend] = useState(false);
  const [resendSuccessMsg, setResendSuccessMsg] = useState('');

  // Clear errors when toggling tabs
  useEffect(() => {
    setAuthError(null);
    setResendSuccessMsg('');
  }, [isSignUp, setAuthError]);

  // OTP 5-minute countdown timer & 30s resend cooldown
  useEffect(() => {
    let interval = null;
    if (signupStep === 'otp') {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setOtpTimer(300);
      setResendCooldown(30);
      setCanResend(false);
    }
    return () => clearInterval(interval);
  }, [signupStep]);

  // Handle Tab Switch (Login <-> Sign Up)
  const handleTabSwitch = (targetMode) => {
    setAuthError(null);
    resetSignupStep();
    if (targetMode === 'login') {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // 1. Submit Login Form
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Welcome back! Logged in successfully.');
      navigate('/');
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  // 2. Submit Signup Form (Initiates OTP)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const res = await initiateSignup(email, password);
    setIsSubmitting(false);
    if (res.success) {
      toast.info('Verification code sent! Please check your email inbox (and spam folder).');
      setOtp('');
      setOtpTimer(300);
      setResendCooldown(30);
      setCanResend(false);
    } else {
      toast.error(res.message || 'Failed to send verification code');
    }
  };

  // 3. Submit OTP Verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setAuthError('Please enter the full 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    const res = await verifySignupOtp(otp.trim());
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Account verified successfully! Welcome to ShopNear 🎉');
      navigate('/');
    } else {
      toast.error(res.message || 'Verification failed');
    }
  };

  // 4. Handle Resend OTP Click
  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendCooldown(30);
    setResendSuccessMsg('');
    setAuthError(null);

    const res = await resendSignupOtp();
    if (res.success) {
      setOtpTimer(300);
      setResendSuccessMsg('New code sent to your email!');
      toast.info('New verification code sent! Check your inbox (or spam folder).');
      setTimeout(() => setResendSuccessMsg(''), 5000);
    } else {
      toast.error(res.message || 'Failed to resend code');
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
          onClick={() => {
            resetSignupStep();
            navigate('/');
          }}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg shrink-0"
        >
          <BrandLogo showTagline={false} size="small" />
        </button>

        <button
          type="button"
          onClick={() => {
            resetSignupStep();
            navigate('/');
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#64748B] hover:text-[#16A34A] transition-colors cursor-pointer py-1.5 px-2.5 sm:px-3 rounded-xl hover:bg-white/80 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3.5 sm:px-4 py-6 sm:py-12 w-full min-w-0">
        <div className="w-full max-w-[440px] bg-white rounded-[24px] sm:rounded-[28px] border border-[#E2E8F0] shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-6 sm:p-10 transition-all duration-200 min-w-0">
          
          {/* Top Pill Tab Switcher (Visible unless in OTP verification mode) */}
          {!(isSignUp && signupStep === 'otp') && (
            <div className="w-full bg-[#EBF8F2] p-1.5 rounded-2xl flex items-center mb-6">
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
          )}

          {/* Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-[13px] flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Resend Success Banner */}
          {resendSuccessMsg && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-[#16A34A] text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{resendSuccessMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW A: OTP VERIFICATION VIEW (Signup Step 2)            */}
          {/* ======================================================== */}
          {isSignUp && signupStep === 'otp' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-[#EBF8F2] text-[#16A34A] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                  Verify Your Email
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-[#0F172A] break-all">
                    {signupEmail}
                  </span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[10px] text-2xl font-bold text-[#0F172A] py-3.5 bg-white border-2 border-[#E2E8F0] focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 rounded-xl focus:outline-none transition-all placeholder:tracking-widest placeholder:text-[#CBD5E1]"
                  />
                  <div className="flex items-center justify-between text-xs text-[#64748B] mt-2 px-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Expires in {formatTime(otpTimer)}</span>
                    </span>
                    <button
                      type="button"
                      disabled={!canResend || isSubmitting}
                      onClick={handleResend}
                      className={`font-semibold flex items-center gap-1 transition-colors ${
                        canResend
                          ? 'text-[#16A34A] hover:underline cursor-pointer'
                          : 'text-[#94A3B8] cursor-not-allowed'
                      }`}
                    >
                      <RotateCw className={`w-3 h-3 ${!canResend ? '' : 'hover:rotate-180 transition-transform'}`} />
                      <span>{canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length !== 6}
                    className="w-full py-3.5 bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] disabled:bg-[#94A3B8] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer shadow-xs disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Verifying Code...' : 'Verify & Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      resetSignupStep();
                    }}
                    className="w-full py-2 text-center text-xs text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                  >
                    Change email address / Edit
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ======================================================== */
            /* VIEW B: LOGIN / INITIAL SIGNUP VIEW                      */
            /* ======================================================== */
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
              <form
                onSubmit={!isSignUp ? handleLoginSubmit : handleSignupSubmit}
                className="space-y-4"
              >
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
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-xs sm:text-[13px] w-full min-w-0">
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
                      onClick={() => alert('Password reset will be available soon.')}
                      className="font-medium text-[#16A34A] hover:underline cursor-pointer shrink-0"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <div className="pt-0.5 text-xs text-[#64748B] leading-relaxed">
                    By clicking Sign Up, we will email you a 6-digit OTP verification code.
                  </div>
                )}

                {/* 4. Primary Solid Green Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-3.5 bg-[#16A34A] hover:bg-[#0F7A44] active:bg-[#0A5630] disabled:bg-[#94A3B8] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? !isSignUp
                        ? 'Signing In...'
                        : 'Sending Verification Code...'
                      : !isSignUp
                      ? 'Log In'
                      : 'Sign Up'}
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

              {/* 6. Continue with Google Button */}
              <button
                type="button"
                onClick={() => alert('Google Sign-In will be available soon.')}
                className="w-full py-2.5 sm:py-3 bg-white hover:bg-slate-50 active:bg-slate-100 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl text-xs sm:text-sm font-semibold text-[#0F172A] transition-all flex items-center justify-center gap-2.5 shadow-2xs cursor-pointer"
              >
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
