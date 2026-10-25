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

      // If production direct signup was used
      if (data.directSignup && data.user) {
        setUser(data.user);
        setSignupStep('form');
        setSignupEmail('');
        return { success: true, directSignup: true, message: data.message, user: data.user };
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

  // 6. Update Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to update profile' };
      }
      setUser(data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, message: 'Network error while updating profile' };
    }
  };

  // 7. Upload Avatar
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to upload image' };
      }
      setUser(data.user);
      return { success: true, message: data.message, avatar: data.avatar };
    } catch (err) {
      console.error('Error uploading avatar:', err);
      return { success: false, message: 'Network error while uploading profile photo' };
    }
  };

  // 7B. Remove Avatar
  const removeAvatar = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/avatar`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to remove image' };
      }
      setUser(data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (err) {
      console.error('Error removing avatar:', err);
      return { success: false, message: 'Network error while removing profile photo' };
    }
  };

  // 8. Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to change password' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error changing password:', err);
      return { success: false, message: 'Network error while changing password' };
    }
  };

  // 9. Delete Account
  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/account`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to delete account' };
      }
      setUser(null);
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error deleting account:', err);
      return { success: false, message: 'Network error while deleting account' };
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
        setUser,
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
        updateProfile,
        uploadAvatar,
        removeAvatar,
        changePassword,
        deleteAccount,
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
