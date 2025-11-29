import React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="HabitLoop Logo" className="h-12 w-12 object-contain rounded-md shadow-sm" />
        <span className="text-2xl font-bold text-black whitespace-nowrap">HabitLoop</span>
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

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          title="Log Daily Habits"
          onClick={() => navigate('/log')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="font-medium">Log Habits</span>
        </button>
        <div className="text-xs text-gray-500">
          <span className="font-medium">Source:</span> Google Sheets
        </div>
      </div>
    </header>
  );
}
