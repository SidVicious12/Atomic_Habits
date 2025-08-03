import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllDailyLogs, 
  getLatestDailyLog, 
  upsertDailyLog,
  getDailyLogsPaginated,
  getDailyLogsForDateRange,
  getDailyLogsSummary
} from '@/lib/daily-logs';
import { getDailyLogsPaginated as getPaginated } from '@/lib/daily-logs-paginated';
import { queryKeys, cacheUtils } from '@/lib/react-query';
import { useToast } from '@/components/ui/toast';
import type { DailyLogFormData } from '@/components/DailyLogForm';

// Hook for getting all daily logs with caching
export function useDailyLogs() {
  return useQuery({
    queryKey: queryKeys.dailyLogs,
    queryFn: getAllDailyLogs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting paginated daily logs
export function useDailyLogsPaginated(page: number = 1, pageSize: number = 30) {
  return useQuery({
    queryKey: queryKeys.dailyLogsPaginated(page, pageSize),
    queryFn: () => getPaginated(page, pageSize),
    staleTime: 3 * 60 * 1000, // 3 minutes for paginated data
    gcTime: 8 * 60 * 1000, // 8 minutes
    keepPreviousData: true, // Keep previous page data while loading new page
  });
}

// Hook for getting daily logs within a date range
export function useDailyLogsDateRange(startDate: string, endDate: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.dailyLogsDateRange(startDate, endDate),
    queryFn: () => getDailyLogsForDateRange(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes for date ranges
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for getting daily logs summary
export function useDailyLogsSummary(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.dailyLogsSummary(days),
    queryFn: () => getDailyLogsSummary(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting the latest daily log
export function useLatestDailyLog() {
  return useQuery({
    queryKey: queryKeys.latestDailyLog,
    queryFn: getLatestDailyLog,
    staleTime: 2 * 60 * 1000, // 2 minutes - more fresh for recent data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating/updating daily logs
export function useUpsertDailyLog() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: (data: DailyLogFormData) => upsertDailyLog(data),
    onSuccess: (data, variables) => {
      // Show success message
      success('Daily log saved!', 'Your habits have been recorded successfully.');
      
      // Update cache optimistically
      cacheUtils.updateDailyLogCache(data);
      
      // Prefetch related data
      queryClient.prefetchQuery({
        queryKey: queryKeys.dailyLogsSummary(30),
        staleTime: 5 * 60 * 1000,
      });
    },
    onError: (error) => {
      // Error handling is done in the database error handler
      console.error('Mutation error:', error);
    },
  });
}

// Hook for bulk operations (future enhancement)
export function useBulkUpdateDailyLogs() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  return useMutation({
    mutationFn: async (updates: DailyLogFormData[]) => {
      // Process updates in batches to avoid overwhelming the database
      const batchSize = 5;
      const results = [];
      
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const batchPromises = batch.map(update => upsertDailyLog(update));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      return results;
    },
    onSuccess: (data) => {
      success('Bulk update completed!', `Updated ${data.length} daily logs.`);
      cacheUtils.invalidateDailyLogs();
    },
    onError: (error) => {
      error('Bulk update failed', 'Some updates may have failed. Please try again.');
      console.error('Bulk update error:', error);
    },
  });
}

// Hook for prefetching data (performance optimization)
export function usePrefetchDailyLogs() {
  const queryClient = useQueryClient();
  
  const prefetchSummary = (days: number = 30) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dailyLogsSummary(days),
      queryFn: () => getDailyLogsSummary(days),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchDateRange = (startDate: string, endDate: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dailyLogsDateRange(startDate, endDate),
      queryFn: () => getDailyLogsForDateRange(startDate, endDate),
      staleTime: 10 * 60 * 1000,
    });
  };
  
  const prefetchNextPage = (currentPage: number, pageSize: number = 30) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dailyLogsPaginated(currentPage + 1, pageSize),
      queryFn: () => getPaginated(currentPage + 1, pageSize),
      staleTime: 3 * 60 * 1000,
    });
  };
  
  return {
    prefetchSummary,
    prefetchDateRange,
    prefetchNextPage,
  };
}

// Hook for cache management
export function useDailyLogsCache() {
  const queryClient = useQueryClient();
  
  const invalidateAll = () => cacheUtils.invalidateDailyLogs();
  
  const getCachedSummary = (days: number = 30) => {
    return queryClient.getQueryData(queryKeys.dailyLogsSummary(days));
  };
  
  const getCachedLatest = () => {
    return queryClient.getQueryData(queryKeys.latestDailyLog);
  };
  
  const updateCache = (updatedLog: any) => {
    cacheUtils.updateDailyLogCache(updatedLog);
  };
  
  return {
    invalidateAll,
    getCachedSummary,
    getCachedLatest,
    updateCache,
  };
}