/**
 * MobileHubPage - Mobile interface for habit tracking
 * Uses shared HistoryView component for consistency with desktop
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Calendar,
  History,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistoryData, useCanWrite, useDailyLogsCache } from '@/hooks/useDailyLogs';
import { isValidForwardDate } from '@/lib/google-sheets-write';
import HistoryView from '@/components/HistoryView';

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Tab type
type TabType = 'history' | 'entry';

export default function MobileHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const { isLoading, refetch } = useHistoryData(7);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header 
        className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 shadow-lg"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">HabitLoop Mobile</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <Link
              to="/"
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Go home"
            >
              <Home size={20} />
            </Link>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div className="flex bg-white/20 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all",
              activeTab === 'history'
                ? "bg-white text-indigo-600"
                : "text-white/80 hover:text-white"
            )}
          >
            <History size={18} />
            History
          </button>
          <button
            onClick={() => setActiveTab('entry')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all",
              activeTab === 'entry'
                ? "bg-white text-indigo-600"
                : "text-white/80 hover:text-white"
            )}
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {activeTab === 'history' ? (
          <HistoryView variant="mobile" daysToShow={7} />
        ) : (
          <ForwardEntryView />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-40" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="bg-slate-900 rounded-2xl px-4 py-3 flex justify-around shadow-xl">
          <Link to="/mobile" className="flex flex-col items-center text-indigo-400">
            <Calendar size={24} />
            <span className="text-xs mt-1">Hub</span>
          </Link>
          <Link to="/today" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
            <Plus size={24} />
            <span className="text-xs mt-1">Quick Log</span>
          </Link>
          <Link to="/" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
            <Home size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

// Forward Entry View Component
function ForwardEntryView() {
  const canWrite = useCanWrite();
  const { dateRange, entriesByDate } = useHistoryData(8);
  
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // Generate date options (today + 7 days forward)
  const dateOptions = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(getLocalDateString(date));
    }
    return dates;
  }, []);

  // Check if selected date has existing entry
  const hasExisting = !!entriesByDate[selectedDate];

  // Validate date
  const dateValidation = isValidForwardDate(selectedDate, 7);

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatRelativeDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  if (!canWrite) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
        <AlertTriangle className="text-yellow-500 mx-auto mb-2" size={32} />
        <p className="text-yellow-700 font-medium">Write Access Not Configured</p>
        <p className="text-yellow-600 text-sm mt-1">
          Set VITE_GOOGLE_SHEETS_WEBHOOK_URL in your .env file to enable writing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Date</h2>
        
        {/* Date selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {dateOptions.map((date) => {
            const isSelected = date === selectedDate;
            const hasEntry = !!entriesByDate[date];
            const isToday = date === getLocalDateString();
            const parts = date.split('-');
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "p-2 rounded-lg text-center transition-all relative",
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : hasEntry
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <div className="text-xs font-medium">
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {dateObj.getDate()}
                </div>
                {isToday && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                    isSelected ? "bg-white" : "bg-indigo-500"
                  )} />
                )}
                {hasEntry && !isSelected && (
                  <CheckCircle2 size={12} className="absolute bottom-1 right-1 text-green-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Validation message */}
        {!dateValidation.valid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{dateValidation.error}</p>
          </div>
        )}

        {/* Selected date info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-gray-600">
            Selected: <span className="font-semibold text-gray-800">{formatDateDisplay(selectedDate)}</span>
            <span className="text-gray-500 ml-2">({formatRelativeDate(selectedDate)})</span>
          </p>
          {hasExisting && (
            <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
              <CheckCircle2 size={14} />
              Entry exists for this date
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Link
            to={`/today?date=${selectedDate}`}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} />
            {hasExisting ? 'Edit Entry' : 'Create New Entry'}
          </Link>
          
          <Link
            to="/today"
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Clock size={20} />
            Quick Log Today
          </Link>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Forward Entry</h3>
        <p className="text-blue-700 text-sm">
          You can log habits up to 7 days in advance. Great for planning ahead when traveling
          or if you know your schedule in advance.
        </p>
      </div>
    </div>
  );
}
