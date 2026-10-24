import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import MyShopsPage from './pages/MyShopsPage';
import AddNewShopPage from './pages/AddNewShopPage';
import FavouritesPage from './pages/FavouritesPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* 1. Public Guest Landing Page (Shop Discovery) */}
        <Route path="/" element={<HomePage />} />

        {/* 2. Public Login Route */}
        <Route path="/login" element={<AuthPage mode="login" />} />

        {/* 3. Public Signup Route */}
        <Route path="/signup" element={<AuthPage mode="signup" />} />

        {/* 4. Protected Authenticated Routes */}
        <Route
          path="/my-shops"
          element={
            <ProtectedRoute>
              <MyShopsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-shops/new"
          element={
            <ProtectedRoute>
              <AddNewShopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-shop"
          element={
            <ProtectedRoute>
              <AddNewShopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={<Navigate to="/favourites" replace />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
