import React, { useState, useEffect } from 'react';

import { Routes, Route, Outlet } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Homepage from './pages/Homepage';
import CategoryPage from './pages/CategoryPage';
import HabitDetailPage from './pages/HabitDetailPage';
import { RequireAuth } from './components/auth/RequireAuth';
import LoginPage from './pages/login';
import ForgotPasswordPage from './pages/forgot-password';
import UpdatePasswordPage from './pages/update-password';
import DailyLogPage from './pages/DailyLogPage';

// This layout component will be protected and includes the nav/sidebar
const AppLayout = () => {
  // Static categories reflecting the new daily log structure
  const categories = [
    'Morning', 
    'Intake', 
    'Night',
    'Fitness',
    'Wellness',
    'Metrics'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-foreground">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar categories={categories} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* This renders the nested child route */}
        </main>
      </div>
    </div>
  );
};

import IntroPage from './pages/intro';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<IntroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />

      {/* Protected routes */}
      <Route 
        path="/*" 
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Homepage />} />
        <Route path="log" element={<DailyLogPage />} />
        <Route path="category/:categoryName" element={<CategoryPage />} />
        <Route path="habit/:habitName" element={<HabitDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;