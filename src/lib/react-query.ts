import { QueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';

// Global error handler for React Query
function queryErrorHandler(error: unknown, toast: ReturnType<typeof useToast>) {
  const title = 'Connection Error';
  let message = 'Something went wrong. Please check your connection and try again.';

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('fetch')) {
      message = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else if (error.message.includes('401')) {
      message = 'Session expired. Please log in again.';
    } else if (error.message.includes('403')) {
      message = 'Access denied. You may not have permission for this action.';
    } else if (error.message.includes('500')) {
      message = 'Server error. Our team has been notified.';
    }
  }

  // Show toast notification for errors
  toast.error(title, message);
}

// Create QueryClient with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes for most data
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: (failureCount, error) => {
        // Don't retry for 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 2;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus only for critical data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always',
      // Background refetch interval (10 minutes)
      refetchInterval: 10 * 60 * 1000,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Error handling for mutations will be handled per-component
    },
  },
});

// Query key factory for consistent cache keys
export const queryKeys = {
  // Daily logs
  dailyLogs: ['dailyLogs'] as const,
  dailyLogsPaginated: (page: number, pageSize: number) => ['dailyLogs', 'paginated', page, pageSize] as const,
  dailyLogsDateRange: (startDate: string, endDate: string) => ['dailyLogs', 'dateRange', startDate, endDate] as const,
  dailyLogsSummary: (days: number) => ['dailyLogs', 'summary', days] as const,
  latestDailyLog: ['dailyLogs', 'latest'] as const,
  
  // User data
  user: ['user'] as const,
  userAuth: ['user', 'auth'] as const,
  
  // Habits (if implemented)
  habits: ['habits'] as const,
  habit: (habitId: string) => ['habits', habitId] as const,
  
  // Categories
  categories: ['categories'] as const,
  category: (categoryName: string) => ['categories', categoryName] as const,
} as const;

// Prefetch utilities
export const prefetchQueries = {
  dailyLogs: () => {
    // Prefetch commonly accessed data
    return queryClient.prefetchQuery({
      queryKey: queryKeys.dailyLogsSummary(30),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  },
  
  userProfile: () => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.user,
      staleTime: 30 * 60 * 1000, // 30 minutes - user data changes less frequently
    });
  },
};

// Cache management utilities
export const cacheUtils = {
  // Invalidate all daily logs data
  invalidateDailyLogs: () => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.dailyLogs,
    });
  },
  
  // Invalidate user data
  invalidateUser: () => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.user,
    });
  },
  
  // Clear all cache
  clearAll: () => {
    return queryClient.clear();
  },
  
  // Update cache optimistically
  updateDailyLogCache: (updatedLog: any) => {
    // Update latest log cache
    queryClient.setQueryData(queryKeys.latestDailyLog, updatedLog);
    
    // Invalidate list queries to refetch
    queryClient.invalidateQueries({
      queryKey: queryKeys.dailyLogs,
    });
  },
};