import { useQuery } from '@tanstack/react-query';
import { getAllDailyLogsFromSheets, getLatestDailyLogFromSheets, type DailyLog } from '../lib/google-sheets';

/**
 * React Query hook to fetch all daily logs from Google Sheets
 */
export function useDailyLogsFromSheets() {
  return useQuery<DailyLog[], Error>({
    queryKey: ['dailyLogs', 'googleSheets'],
    queryFn: getAllDailyLogsFromSheets,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * React Query hook to fetch the latest daily log from Google Sheets
 */
export function useLatestDailyLogFromSheets() {
  return useQuery<DailyLog | null, Error>({
    queryKey: ['latestDailyLog', 'googleSheets'],
    queryFn: getLatestDailyLogFromSheets,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
