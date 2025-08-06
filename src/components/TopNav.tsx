import React from 'react';
import { Bell, PlusCircle, Search, LogOut, Upload, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth';

export default function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Atomic Habits Logo" className="h-12 w-12 object-contain rounded-md shadow-sm" />
        <span className="text-2xl font-bold text-black whitespace-nowrap">Atomic Habits</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 mx-6 max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search habits..."
            className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Icons & User Avatar */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          title="Add Daily Log"
          onClick={() => navigate('/log')}
          className="text-blue-600 hover:text-blue-700"
        >
          <PlusCircle className="h-6 w-6" />
        </button>
        <button
          type="button"
          title="Import Historical Data"
          onClick={() => navigate('/import')}
          className="text-green-600 hover:text-green-700"
        >
          <Upload className="h-6 w-6" />
        </button>
        <button
          type="button"
          title="Database Diagnostics"
          onClick={() => navigate('/diagnostics')}
          className="text-orange-600 hover:text-orange-700"
        >
          <Activity className="h-6 w-6" />
        </button>
        <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
        {user && (
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-semibold text-sm cursor-pointer">
              {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <button onClick={signOut} title="Sign Out">
              <LogOut className="h-6 w-6 text-gray-600 cursor-pointer hover:text-red-500" />
            </button>
          </div>
        )}
      </div>

    </header>
  );
}
