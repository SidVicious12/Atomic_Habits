import React from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary } from './lib/error-boundary';
import { useAuth } from './hooks/useAuth';
import './styles/responsive-3d.css';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Homepage from './pages/Homepage';
import CategoryPage from './pages/CategoryPage';
import HabitDetailPage from './pages/HabitDetailPage';
import DailyLogPage from './pages/DailyLogPage';
import TodayPage from './pages/TodayPage';
import LoginPage from './pages/login';
import MobileHubPage from './pages/MobileHubPage';

// Protected route wrapper - redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, isConfigured } = useAuth();
  
  // If Supabase isn't configured, allow access (for development)
  if (!isConfigured) {
    return <>{children}</>;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// This layout component includes the nav/sidebar
const AppLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-sans text-foreground">
        <Sidebar />
        <TopBar />
        {/* Main content area - offset for fixed sidebar and top bar + safe area */}
        <div className="lg:ml-72 transition-all duration-300 pt-16" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
          <main className="min-h-screen p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Layout for log page (with sidebar and top bar)
const LogLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-foreground">
        <Sidebar />
        <TopBar />
        <div className="lg:ml-72 transition-all duration-300 pt-16" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top))' }}>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

// Minimal layout for mobile-first pages (no sidebar/topbar)
const MinimalLayout = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

// Smart redirect: sends mobile users to /today, desktop to /
const SmartHome = () => {
  const isMobile = window.innerWidth < 768;
  
  // On first visit from mobile, redirect to /today
  if (isMobile && !sessionStorage.getItem('visited')) {
    sessionStorage.setItem('visited', 'true');
    return <Navigate to="/today" replace />;
  }
  
  return <Homepage />;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          {/* Login page - public */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Mobile-first pages - minimal chrome (protected) */}
          <Route element={<MinimalLayout />}>
            <Route path="/today" element={<TodayPage />} />
            <Route path="/mobile" element={<MobileHubPage />} />
          </Route>
          
          {/* Main application routes - protected */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<SmartHome />} />
            <Route path="category/:categoryName" element={<CategoryPage />} />
            <Route path="habit/:habitName" element={<HabitDetailPage />} />
          </Route>

          {/* Log page (protected) */}
          <Route element={<LogLayout />}>
            <Route path="/log" element={<DailyLogPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;