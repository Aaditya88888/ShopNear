import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AuthModal({ type = 'login', onClose }) {
  const [authType, setAuthType] = useState(type);
  const [role, setRole] = useState('user'); // 'user' or 'shopkeeper'
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
          <BrandLogo size="small" />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              {authType === 'login' ? 'Welcome Back!' : 'Registration Successful!'}
            </h3>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
              This is a frontend prototype. Real authentication and backend sessions will be connected in Phase 2.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-[#16A34A] text-white text-xs font-semibold rounded-xl hover:bg-[#0F7A44] transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <div className="pt-5 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                {authType === 'login' ? 'Sign in to ShopNear' : 'Create your Account'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                {authType === 'login'
                  ? 'Access your saved shops and personalized local searches'
                  : 'Join ShopNear as a customer or register your local shop'}
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  role === 'user'
                    ? 'bg-white text-[#16A34A] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Customer / User
              </button>
              <button
                type="button"
                onClick={() => setRole('shopkeeper')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  role === 'shopkeeper'
                    ? 'bg-white text-[#16A34A] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Shopkeeper
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              {authType === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    {role === 'shopkeeper' ? 'Shop / Owner Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder={role === 'shopkeeper' ? 'e.g. Ramesh Sharma' : 'e.g. Rahul Gupta'}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="name@example.com or 10-digit mobile"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#16A34A] hover:bg-[#0F7A44] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  {authType === 'login' ? 'Sign in' : 'Create Account'}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthType(authType === 'login' ? 'signup' : 'login')}
                className="text-xs text-[#64748B] hover:text-[#16A34A] transition-colors"
              >
                {authType === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
