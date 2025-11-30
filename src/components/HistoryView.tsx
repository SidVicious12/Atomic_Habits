/**
 * HistoryView - Shared component for habit history viewing
 * Used by both MobileHubPage and HistoryPage (desktop)
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit3,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistoryData, useCanWrite, useDailyLogsCache } from '@/hooks/useDailyLogs';
import { type DailyLogEntry } from '@/lib/google-sheets-write';
import { type DailyLog } from '@/lib/google-sheets';
import EditEntryModal from '@/components/EditEntryModal';

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Date helper functions
function formatDateDisplay(dateStr: string, includeYear: boolean = false): string {
  const parts = dateStr.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };
  if (includeYear) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('en-US', options);
}

function formatRelativeDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
}

// Convert DailyLog to DailyLogEntry for editing
function logToEntry(log: DailyLog): Partial<DailyLogEntry> {
  return {
    date: log.log_date || (log as any).date,
    time_awake: log.time_awake,
    time_at_work: log.time_at_work,
    time_left_work: log.time_left_work,
    coffee: log.coffee,
    breakfast: log.breakfast,
    phone_on_wake: log.phone_on_wake,
    netflix_in_bed: log.netflix_in_bed,
    brushed_teeth_night: log.brushed_teeth_night,
    washed_face_night: log.washed_face_night,
    green_tea: log.green_tea,
    alcohol: log.alcohol,
    smoke: log.smoke,
    soda: log.soda,
    chocolate: log.chocolate,
    relaxed_today: log.relaxed_today,
    morning_walk: log.morning_walk,
    dabs_count: log.dabs_count,
    water_bottles_count: log.water_bottles_count,
    pages_read_count: log.pages_read_count,
    weight_lbs: log.weight_lbs,
    calories: log.calories,
    workout: log.workout as any,
    day_rating: log.day_rating as any,
    dream: (log as any).dream,
    latest_hype: (log as any).latest_hype,
    bed_time: (log as any).bed_time,
  };
}

interface HistoryViewProps {
  variant: 'mobile' | 'desktop';
  daysToShow?: number;
}

export default function HistoryView({ variant, daysToShow = 14 }: HistoryViewProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Partial<DailyLogEntry> | null>(null);
  
  const canWrite = useCanWrite();
  const { invalidateAll } = useDailyLogsCache();
  const { dateRange, entriesByDate, entriesInRange, totalEntries, isLoading, error, refetch } = useHistoryData(daysToShow);
  
  // Handle edit click
  const handleEditClick = useCallback((date: string, log: DailyLog) => {
    const entry = logToEntry(log);
    entry.date = date;
    setEditingEntry(entry);
    setEditingDate(date);
  }, []);

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

  // Mobile variant
  if (variant === 'mobile') {
    return (
      <div className="space-y-3">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
            <p className="text-gray-500">Loading history...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-2" size={32} />
            <p className="text-red-700 font-medium">Failed to load history</p>
            <p className="text-red-600 text-sm mb-3">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* History List */}
        {!isLoading && !error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Last {Math.min(daysToShow, 7)} Days</h2>
              <span className="text-sm text-gray-500">
                {entriesInRange} entries found
              </span>
            </div>

            {dateRange.slice(0, 7).map((date) => {
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
                            onClick={() => handleEditClick(date, entry)}
                            className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors"
                            aria-label="Edit entry"
                          >
                            <Edit3 size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 text-gray-400 text-sm">
                            <XCircle size={16} />
                            No entry
                          </span>
                          <Link
                            to={`/today?date=${date}`}
                            className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors"
                            aria-label="Add entry"
                          >
                            <Plus size={18} />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {hasData && <EntrySummary log={entry} variant="mobile" />}
                </div>
              );
            })}
          </>
        )}

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

  // Desktop variant
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <History className="text-indigo-600" size={28} />
            Habit History
          </h1>
          <p className="text-gray-500 mt-1">View and edit your past entries</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/today"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            New Entry
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Last 7 Days Logged</p>
          <p className="text-2xl font-bold text-green-600">
            {dateRange.slice(0, 7).filter(d => entriesByDate[d]).length}/7
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Write Access</p>
          <p className={cn("text-2xl font-bold", canWrite ? "text-green-600" : "text-red-500")}>
            {canWrite ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
          <p className="text-gray-500">Loading history...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-3" size={40} />
          <p className="text-red-700 font-medium text-lg">Failed to load history</p>
          <p className="text-red-600 text-sm mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* History Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dateRange.map((date) => {
                  const entry = entriesByDate[date];
                  const hasData = !!entry;

                  return (
                    <tr key={date} className={cn("hover:bg-gray-50 transition-colors", hasData ? "" : "bg-gray-50/50")}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatDateDisplay(date, true)}</p>
                          <p className="text-sm text-gray-500">{formatRelativeDate(date)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasData ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle2 size={14} />
                            Logged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            <XCircle size={14} />
                            No Entry
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasData ? (
                          <EntrySummary log={entry} variant="desktop" />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {hasData ? (
                          <button
                            onClick={() => handleEditClick(date, entry)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                            Edit
                          </button>
                        ) : (
                          <Link
                            to={`/today?date=${date}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Plus size={16} />
                            Add
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

// Entry Summary Component
interface EntrySummaryProps {
  log: DailyLog;
  variant: 'mobile' | 'desktop';
}

function EntrySummary({ log, variant }: EntrySummaryProps) {
  const allMetrics: Array<{ label: string; value: any; suffix?: string }> = [
    { label: 'Water', value: log.water_bottles_count, suffix: ' bottles' },
    { label: 'Workout', value: log.workout },
    { label: 'Pages', value: log.pages_read_count },
    { label: 'Rating', value: log.day_rating },
  ];
  
  const metrics = allMetrics.filter(m => {
    if (m.value === undefined || m.value === null) return false;
    if (m.value === 0 || m.value === false) return false;
    if (typeof m.value === 'string' && (m.value === '' || m.value === 'No')) return false;
    return true;
  });

  if (metrics.length === 0) {
    return variant === 'desktop' 
      ? <span className="text-gray-400 text-sm">No details</span>
      : null;
  }

  return (
    <div className={cn(
      "flex flex-wrap gap-2",
      variant === 'mobile' && "mt-2 pt-2 border-t border-gray-100"
    )}>
      {metrics.slice(0, 4).map((metric, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-xs",
            variant === 'mobile' ? "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-600"
          )}
        >
          <span className="font-medium">{metric.label}:</span>
          <span className="ml-1">{metric.value}{metric.suffix || ''}</span>
        </span>
      ))}
    </div>
  );
}
