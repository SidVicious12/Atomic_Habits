import { supabase } from './supabase';
import type { DailyLogFormData } from '@/components/DailyLogForm';
import { handleDatabaseError, retryDatabaseOperation, logDatabaseError } from './database-error-handler';

/**
 * Inserts or updates a daily log entry for the currently authenticated user.
 * 
 * @param logData The data from the daily log form.
 */
export async function upsertDailyLog(logData: DailyLogFormData) {
  return retryDatabaseOperation(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated to save daily log.');
    }

    // Prepare the data for Supabase, converting empty strings to null
    const supabaseData = {
      ...logData,
      user_id: user.id,
      log_date: logData.log_date,
      time_awake: logData.time_awake || null,
      bed_time: logData.bed_time || null,
      // Ensure numeric fields are numbers, not strings
      dabs_count: logData.dabs_count ?? null,
      water_bottles_count: logData.water_bottles_count ?? null,
      pages_read_count: logData.pages_read_count ?? null,
      weight_lbs: logData.weight_lbs ?? null,
      calories: logData.calories ?? null,
    };

    // Use upsert to either insert a new log or update an existing one for the same day.
    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(supabaseData, { onConflict: 'user_id, log_date' })
      .select();

    if (error) {
      const dbError = handleDatabaseError(error);
      logDatabaseError(dbError, 'upsertDailyLog');
      throw dbError;
    }

    return data;
  }, 2, 1000); // Retry up to 2 times with 1 second base delay
}

/**
 * Fetches the latest daily log for the currently authenticated user.
 */
export async function getLatestDailyLog() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('User not authenticated to fetch daily log.');
    return null;
  }

  const { data, error } = await supabase
    .from('daily_logs')
    .select('id, log_date, coffee, breakfast, green_tea, water_bottles_count, pages_read_count, day_rating, weight_lbs, created_at')
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'range not found' errors which mean no rows exist
    console.error('Error fetching latest daily log:', error);
    throw error;
  }

  return data;
}

/**
 * Fetches all daily logs for the currently authenticated user.
 */
export async function getAllDailyLogs() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('User not authenticated to fetch daily logs.');
    return [];
  }

  console.log('Fetching daily logs for user:', user.id);

  const { data, error } = await supabase
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
      soda, 
      chocolate,
      dabs_count, 
      water_bottles_count, 
      pages_read_count,
      brushed_teeth_night, 
      washed_face_night, 
      netflix_in_bed, 
      phone_on_wake,
      workout, 
      relaxed_today, 
      day_rating,
      weight_lbs, 
      calories,
      created_at
    `)
    .eq('user_id', user.id)
    .order('log_date', { ascending: true })
    .limit(365); // Limit to 1 year of data for performance

  if (error) {
    console.error('Error fetching all daily logs:', error);
    throw error;
  }

  console.log('Raw Supabase response:', { data, count: data?.length });
  console.log('Sample entries:', data?.slice(0, 3));

  return data;
}
