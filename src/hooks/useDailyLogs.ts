import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAllDailyLogsFromSheets, getLatestDailyLogFromSheets, type DailyLog } from '../lib/google-sheets';
import { appendDailyLogToSheet, upsertDailyLogToSheet, isWriteConfigured, type DailyLogEntry } from '../lib/google-sheets-write';
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