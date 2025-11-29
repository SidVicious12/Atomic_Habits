import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllDailyLogsFromSheets, getLatestDailyLogFromSheets, type DailyLog } from '../lib/google-sheets';
import { queryKeys } from '@/lib/react-query';

// Hook for getting all daily logs with caching - NOW FROM GOOGLE SHEETS
export function useDailyLogs() {
  return useQuery<DailyLog[], Error>({
    queryKey: queryKeys.dailyLogs,
    queryFn: getAllDailyLogsFromSheets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in newer versions)
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

// DEPRECATED: Write operations are no longer supported (read-only from Google Sheets)
// To add new logs, update your Google Sheet directly
export function useUpsertDailyLog() {
  return {
    mutate: () => {
      console.warn('Write operations are disabled. Please update Google Sheets directly.');
      alert('This app is now read-only. Please update your Google Sheet to add new logs.');
    },
    mutateAsync: async () => {
      throw new Error('Write operations are disabled. Please update Google Sheets directly.');
    },
    isPending: false,
    isError: false,
    isSuccess: false,
  };
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