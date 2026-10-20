import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <Routes>
      {/* 1. Guest Landing Page */}
      <Route path="/" element={<HomePage />} />

      {/* 2. Login Route */}
      <Route path="/login" element={<AuthPage mode="login" />} />

      {/* 3. Signup Route */}
      <Route path="/signup" element={<AuthPage mode="signup" />} />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
