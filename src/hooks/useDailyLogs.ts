import { useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAllDailyLogsFromSheets, getLatestDailyLogFromSheets, type DailyLog } from '../lib/google-sheets';
import { 
  appendDailyLogToSheet, 
  upsertDailyLogToSheet, 
  isWriteConfigured, 
  getDateRange,
  getRowByDate,
  updateRowByDate,
  type DailyLogEntry,
  type DateRangeResult,
  type RowByDateResult 
} from '../lib/google-sheets-write';
import { queryKeys } from '@/lib/react-query';

// Hook for getting all daily logs with caching - FROM GOOGLE SHEETS
export function useDailyLogs() {
  return useQuery<DailyLog[], Error>({
    queryKey: queryKeys.dailyLogs,
    queryFn: getAllDailyLogsFromSheets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting the latest daily log from Google Sheets
export function useLatestDailyLog() {
  return useQuery<DailyLog | null, Error>({
    queryKey: ['latestDailyLog', 'googleSheets'],
    queryFn: getLatestDailyLogFromSheets,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for appending a new row to Google Sheets (never overwrites)
export function useAppendDailyLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entry: DailyLogEntry) => appendDailyLogToSheet(entry),
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs });
      queryClient.invalidateQueries({ queryKey: ['latestDailyLog'] });
    },
    onError: (error) => {
      console.error('Failed to append daily log:', error);
    },
  });
}

// Hook for upserting (update if exists, insert if not) to Google Sheets
export function useUpsertDailyLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entry: DailyLogEntry) => upsertDailyLogToSheet(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs });
      queryClient.invalidateQueries({ queryKey: ['latestDailyLog'] });
    },
    onError: (error) => {
      console.error('Failed to upsert daily log:', error);
    },
  });
}

// Check if write functionality is available
export function useCanWrite() {
  return isWriteConfigured();
}

// Hook for cache management
export function useDailyLogsCache() {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs });
    queryClient.invalidateQueries({ queryKey: ['latestDailyLog', 'googleSheets'] });
  };
  
  const getCachedLatest = () => {
    return queryClient.getQueryData(['latestDailyLog', 'googleSheets']);
  };
  
  return {
    invalidateAll,
    getCachedLatest,
  };
}

// Hook for fetching entries in a date range (historical viewing)
export function useDateRange(startDate: string, endDate: string) {
  return useQuery<DateRangeResult, Error>({
    queryKey: ['dateRange', startDate, endDate],
    queryFn: () => getDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!startDate && !!endDate,
  });
}

// Hook for fetching a specific row by date
export function useRowByDate(date: string) {
  return useQuery<RowByDateResult, Error>({
    queryKey: ['rowByDate', date],
    queryFn: () => getRowByDate(date),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!date,
  });
}

// Hook for updating an existing row
export function useUpdateRow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entry: DailyLogEntry) => updateRowByDate(entry),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyLogs });
      queryClient.invalidateQueries({ queryKey: ['latestDailyLog'] });
      queryClient.invalidateQueries({ queryKey: ['dateRange'] });
      queryClient.invalidateQueries({ queryKey: ['rowByDate', variables.date] });
    },
    onError: (error) => {
      console.error('Failed to update row:', error);
    },
  });
}

// Helper to get local date string without timezone issues
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Normalize any date string to YYYY-MM-DD format
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
  
  return dateStr;
}

// Helper hook to get last 7 days date range (uses webhook)
export function useLast7Days() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const endDate = getLocalDateString(today);
  const startDate = getLocalDateString(weekAgo);
  
  return useDateRange(startDate, endDate);
}

// NEW: Hook that uses the working public API and filters client-side
export function useHistoryData(daysBack: number = 14) {
  const { data: allLogs, isLoading, error, refetch } = useDailyLogs();
  
  // Generate date range
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(getLocalDateString(date));
    }
    return dates;
  }, [daysBack]);
  
  // Build entries map from all logs
  const entriesByDate = useMemo(() => {
    const map: Record<string, DailyLog> = {};
    if (allLogs) {
      allLogs.forEach(log => {
        const dateStr = log.log_date || log.date;
        if (dateStr) {
          const normalized = normalizeDateToYYYYMMDD(String(dateStr));
          map[normalized] = log;
        }
      });
    }
    return map;
  }, [allLogs]);
  
  // Count entries in date range
  const entriesInRange = useMemo(() => {
    return dateRange.filter(d => entriesByDate[d]).length;
  }, [dateRange, entriesByDate]);
  
  return {
    dateRange,
    entriesByDate,
    entriesInRange,
    totalEntries: allLogs?.length || 0,
    isLoading,
    error,
    refetch,
  };
}