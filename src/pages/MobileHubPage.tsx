/**
 * MobileHubPage - Enhanced mobile interface for habit tracking
 * 
 * Features:
 * 1. Historical Data Viewing - View last 7 days of entries
 * 2. Forward Entry - Log habits up to 7 days ahead
 * 3. Edit Functionality - Modify existing entries with confirmation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Calendar,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Edit3,
  Check,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLast7Days, useUpsertDailyLog, useCanWrite, useDailyLogsCache } from '@/hooks/useDailyLogs';
import { isValidForwardDate, parseRowToEntry, type DailyLogEntry } from '@/lib/google-sheets-write';
import EditEntryModal from '@/components/EditEntryModal';

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Normalize any date string to YYYY-MM-DD format for consistent lookups
function normalizeDateToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Handle MM/DD/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  
  // Fallback: try to parse and convert
  try {
    const date = new Date(dateStr + 'T12:00:00');
    if (!isNaN(date.getTime())) {
      return getLocalDateString(date);
    }
  } catch {
    // ignore
  }
  
  return dateStr;
}

// Date helper functions
function formatDateDisplay(dateStr: string): string {
  const normalized = normalizeDateToYYYYMMDD(dateStr);
  const date = new Date(normalized + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
}

function getDateRange(daysBack: number, daysForward: number): { start: string; end: string } {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  
  start.setDate(start.getDate() - daysBack);
  end.setDate(end.getDate() + daysForward);
  
  return {
    start: getLocalDateString(start),
    end: getLocalDateString(end),
  };
}

// Tab type
type TabType = 'history' | 'entry';

export default function MobileHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Partial<DailyLogEntry> | null>(null);
  
  const canWrite = useCanWrite();
  const { invalidateAll } = useDailyLogsCache();
  const { data: historyData, isLoading, error, refetch } = useLast7Days();
  
  // Get existing entries mapped by date (normalized to YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const map: Record<string, { rowNumber: number; data: any[] }> = {};
    if (historyData?.rows) {
      historyData.rows.forEach(row => {
        // Normalize the date from the API to YYYY-MM-DD for consistent lookups
        const normalizedDate = normalizeDateToYYYYMMDD(row.date);
        map[normalizedDate] = { rowNumber: row.rowNumber, data: row.data };
      });
    }
    return map;
  }, [historyData]);

  // Handle edit click
  const handleEditClick = useCallback((date: string, rowData: any[]) => {
    if (historyData?.headers) {
      const entry = parseRowToEntry(rowData, historyData.headers);
      entry.date = date;
      setEditingEntry(entry);
      setEditingDate(date);
    }
  }, [historyData?.headers]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setEditingDate(null);
    setEditingEntry(null);
  }, []);

  // Handle save success
  const handleSaveSuccess = useCallback(() => {
    invalidateAll();
    refetch();
    handleModalClose();
  }, [invalidateAll, refetch, handleModalClose]);

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
          <HistoryView
            historyData={historyData}
            isLoading={isLoading}
            error={error}
            entriesByDate={entriesByDate}
            onEditClick={handleEditClick}
            onRefresh={refetch}
          />
        ) : (
          <ForwardEntryView
            canWrite={canWrite}
            entriesByDate={entriesByDate}
            headers={historyData?.headers}
            onEditClick={handleEditClick}
          />
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

      {/* Edit Modal */}
      {editingDate && editingEntry && (
        <EditEntryModal
          date={editingDate}
          initialData={editingEntry}
          onClose={handleModalClose}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}

// History View Component
interface HistoryViewProps {
  historyData: any;
  isLoading: boolean;
  error: Error | null;
  entriesByDate: Record<string, { rowNumber: number; data: any[] }>;
  onEditClick: (date: string, data: any[]) => void;
  onRefresh: () => void;
}

function HistoryView({ historyData, isLoading, error, entriesByDate, onEditClick, onRefresh }: HistoryViewProps) {
  // Generate last 7 days using local date strings
  const last7Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(getLocalDateString(date));
    }
    return days;
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <AlertTriangle className="text-red-500 mx-auto mb-2" size={32} />
        <p className="text-red-700 font-medium">Failed to load history</p>
        <p className="text-red-600 text-sm mb-3">{error.message}</p>
        <button
          onClick={() => onRefresh()}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Last 7 Days</h2>
        <span className="text-sm text-gray-500">
          {historyData?.count || 0} entries found
        </span>
      </div>

      {last7Days.map((date) => {
        const entry = entriesByDate[date];
        const hasData = !!entry;

        return (
          <div
            key={date}
            className={cn(
              "bg-white rounded-xl border p-4 transition-all",
              hasData ? "border-green-200" : "border-gray-200"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-800">{formatDateDisplay(date)}</p>
                <p className="text-sm text-gray-500">{formatRelativeDate(date)}</p>
              </div>
              <div className="flex items-center gap-2">
                {hasData ? (
                  <>
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 size={16} />
                      Logged
                    </span>
                    <button
                      onClick={() => onEditClick(date, entry.data)}
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors"
                      aria-label="Edit entry"
                    >
                      <Edit3 size={18} />
                    </button>
                  </>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <XCircle size={16} />
                    No entry
                  </span>
                )}
              </div>
            </div>

            {hasData && entry.data && (
              <EntrySummary data={entry.data} headers={historyData?.headers || []} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Entry Summary Component - shows key habit values
interface EntrySummaryProps {
  data: any[];
  headers: string[];
}

function EntrySummary({ data, headers }: EntrySummaryProps) {
  // Map headers to indices
  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerMap[h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_')] = i;
  });

  // Helper to find value by pattern
  const getValue = (patterns: string[]): any => {
    for (const p of patterns) {
      for (const [key, idx] of Object.entries(headerMap)) {
        if (key.includes(p)) {
          return data[idx];
        }
      }
    }
    return undefined;
  };

  // Key metrics to show
  const metrics = [
    { label: 'Water', value: getValue(['water', 'bottles']), suffix: ' bottles' },
    { label: 'Workout', value: getValue(['workout']), isBool: false },
    { label: 'Pages', value: getValue(['pages', 'read']), suffix: ' read' },
    { label: 'Rating', value: getValue(['day', 'how_was']), isBool: false },
  ].filter(m => m.value !== undefined && m.value !== null && m.value !== '');

  if (metrics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
      {metrics.map((metric, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
        >
          <span className="font-medium">{metric.label}:</span>
          <span className="ml-1">
            {metric.value}
            {metric.suffix || ''}
          </span>
        </span>
      ))}
    </div>
  );
}

// Forward Entry View Component
interface ForwardEntryViewProps {
  canWrite: boolean;
  entriesByDate: Record<string, { rowNumber: number; data: any[] }>;
  headers?: string[];
  onEditClick: (date: string, data: any[]) => void;
}

function ForwardEntryView({ canWrite, entriesByDate, headers, onEditClick }: ForwardEntryViewProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDateString()
  );
  
  const upsertMutation = useUpsertDailyLog();
  const { invalidateAll } = useDailyLogsCache();

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
  const existingEntry = entriesByDate[selectedDate];
  const hasExisting = !!existingEntry;

  // Validate date
  const dateValidation = isValidForwardDate(selectedDate, 7);

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
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {new Date(date + 'T12:00:00').getDate()}
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
          {hasExisting ? (
            <button
              onClick={() => onEditClick(selectedDate, existingEntry.data)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Edit3 size={20} />
              Edit Existing Entry
            </button>
          ) : (
            <Link
              to={`/today?date=${selectedDate}`}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Create New Entry
            </Link>
          )}
          
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
