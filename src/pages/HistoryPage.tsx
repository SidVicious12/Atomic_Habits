/**
 * HistoryPage - Desktop version of habit history viewing
 * 
 * Features:
 * - View last 7 days of entries in a table/card format
 * - Edit existing entries
 * - Quick entry for any date
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  Check,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLast7Days, useCanWrite, useDailyLogsCache } from '@/hooks/useDailyLogs';
import { parseRowToEntry, type DailyLogEntry } from '@/lib/google-sheets-write';
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
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(dateStr: string): string {
  const normalized = normalizeDateToYYYYMMDD(dateStr);
  const date = new Date(normalized + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
}

export default function HistoryPage() {
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
        const normalizedDate = normalizeDateToYYYYMMDD(row.date);
        map[normalizedDate] = { rowNumber: row.rowNumber, data: row.data };
      });
    }
    return map;
  }, [historyData]);

  // Generate last 14 days for desktop view
  const last14Days = useMemo(() => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(getLocalDateString(date));
    }
    return days;
  }, []);

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
          <p className="text-sm text-gray-500">Entries Found</p>
          <p className="text-2xl font-bold text-gray-900">{historyData?.count || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Last 7 Days Logged</p>
          <p className="text-2xl font-bold text-green-600">
            {last14Days.slice(0, 7).filter(d => entriesByDate[d]).length}/7
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
                {last14Days.map((date) => {
                  const entry = entriesByDate[date];
                  const hasData = !!entry;

                  return (
                    <tr key={date} className={cn("hover:bg-gray-50 transition-colors", hasData ? "" : "bg-gray-50/50")}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{formatDateDisplay(date)}</p>
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
                        {hasData && entry.data && historyData?.headers ? (
                          <EntrySummary data={entry.data} headers={historyData.headers} />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {hasData ? (
                          <button
                            onClick={() => handleEditClick(date, entry.data)}
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
    { label: 'Pages', value: getValue(['pages', 'read']), suffix: '' },
    { label: 'Rating', value: getValue(['day', 'how_was']), isBool: false },
  ].filter(m => m.value !== undefined && m.value !== null && m.value !== '' && m.value !== 'No' && m.value !== 0);

  if (metrics.length === 0) {
    return <span className="text-gray-400 text-sm">No details</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {metrics.slice(0, 4).map((metric, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
        >
          <span className="font-medium">{metric.label}:</span>
          <span className="ml-1">{metric.value}{metric.suffix || ''}</span>
        </span>
      ))}
    </div>
  );
}
