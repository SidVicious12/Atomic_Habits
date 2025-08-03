import { supabase } from './supabase';
import type { DailyLogFormData } from '@/components/DailyLogForm';

/**
 * Fetches daily logs with pagination for better performance
 * 
 * @param page Page number (starting from 1)
 * @param pageSize Number of records per page (default: 30)
 * @param dateRange Optional date range filter
 */
export async function getDailyLogsPaginated(
  page: number = 1, 
  pageSize: number = 30,
  dateRange?: { start: string; end: string }
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('User not authenticated to fetch daily logs.');
    return { data: [], totalCount: 0, hasMore: false };
  }

  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('daily_logs')
    .select(`
      id, 
      log_date, 
      coffee, 
      morning_walk, 
      breakfast, 
      green_tea, 
      alcohol, 
      smoke,
      dabs_count, 
      water_bottles_count, 
      pages_read_count,
      netflix_in_bed, 
      phone_on_wake,
      relaxed_today, 
      day_rating,
      weight_lbs, 
      calories
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Add date range filter if provided
  if (dateRange) {
    query = query
      .gte('log_date', dateRange.start)
      .lte('log_date', dateRange.end);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching paginated daily logs:', error);
    throw error;
  }

  return {
    data: data || [],
    totalCount: count || 0,
    hasMore: count ? offset + pageSize < count : false,
    currentPage: page,
    totalPages: count ? Math.ceil(count / pageSize) : 0
  };
}

/**
 * Fetches daily logs for a specific date range (optimized for charts)
 */
export async function getDailyLogsForDateRange(startDate: string, endDate: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('daily_logs')
    .select('log_date, coffee, breakfast, water_bottles_count, pages_read_count, weight_lbs, day_rating')
    .eq('user_id', user.id)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) {
    console.error('Error fetching date range logs:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches summary statistics for dashboard
 */
export async function getDailyLogsSummary(days: number = 30) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      coffee,
      breakfast,
      morning_walk,
      water_bottles_count,
      pages_read_count,
      relaxed_today,
      day_rating,
      weight_lbs
    `)
    .eq('user_id', user.id)
    .gte('log_date', startDate.toISOString().split('T')[0])
    .order('log_date', { ascending: false });

  if (error) {
    console.error('Error fetching summary logs:', error);
    throw error;
  }

  // Calculate summary statistics
  const summary = {
    totalDays: data?.length || 0,
    coffeeCount: data?.filter(d => d.coffee).length || 0,
    breakfastCount: data?.filter(d => d.breakfast).length || 0,
    walkCount: data?.filter(d => d.morning_walk).length || 0,
    avgWaterBottles: data?.length ? 
      data.reduce((sum, d) => sum + (d.water_bottles_count || 0), 0) / data.length : 0,
    avgPagesRead: data?.length ? 
      data.reduce((sum, d) => sum + (d.pages_read_count || 0), 0) / data.length : 0,
    relaxedCount: data?.filter(d => d.relaxed_today).length || 0,
    avgWeight: data?.length ? 
      data.filter(d => d.weight_lbs).reduce((sum, d) => sum + (d.weight_lbs || 0), 0) / 
      data.filter(d => d.weight_lbs).length : 0
  };

  return summary;
}