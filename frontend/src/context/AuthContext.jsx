import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Signup Multi-Step State ('form' | 'otp')
  const [signupStep, setSignupStep] = useState('form');
  const [signupEmail, setSignupEmail] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds

  // Check existing session on application mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  // 1. Initiate Signup (Send OTP)
  const initiateSignup = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Failed to initiate signup';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg, retryAfter: data.retryAfter };
      }

      setSignupEmail(email.trim().toLowerCase());
      setSignupStep('otp');
      setOtpExpiry(data.expiresInSeconds || 300);
      return { success: true, message: data.message };
    } catch (err) {
      const errorMsg = 'Network error. Please ensure the backend server is running.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 2. Verify OTP & Finalize Registration
  const verifySignupOtp = async (otp) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: signupEmail, otp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'OTP verification failed';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }

      setUser(data.user);
      setSignupStep('form');
      setSignupEmail('');
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      const errorMsg = 'Network error while verifying OTP';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 3. Resend OTP
  const resendSignupOtp = async () => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: signupEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Failed to resend verification code';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg, retryAfter: data.retryAfter };
      }

      setOtpExpiry(data.expiresInSeconds || 300);
      return { success: true, message: data.message };
    } catch (err) {
      const errorMsg = 'Network error while resending OTP';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 4. Normal Login (No OTP)
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Invalid email or password';
        setAuthError(errorMsg);
        return { success: false, message: errorMsg };
      }

      setUser(data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      const errorMsg = 'Network error. Please ensure the backend server is running.';
      setAuthError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 5. Logout
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const resetSignupStep = () => {
    setSignupStep('form');
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        signupStep,
        signupEmail,
        otpExpiry,
        initiateSignup,
        verifySignupOtp,
        resendSignupOtp,
        login,
        logout,
        resetSignupStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
