import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from .env file");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugTables() {
  try {
    // First, check if we need to authenticate
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found. Please make sure you are logged in.');
      return;
    }
    
    console.log('Authenticated user ID:', user.id);
    
    // Note: Removed habits table check - table doesn't exist in current schema
    // The app uses daily_logs table for habit tracking instead

    console.log('\n=== CHECKING DAILY_LOGS TABLE ===');
    const { data: logsData, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id) // Add user filter for RLS compliance
      .order('log_date', { ascending: false })
      .limit(5);
    
    if (logsError) {
      console.error('Error fetching daily_logs:', logsError);
    } else {
      console.log(`Found ${logsData?.length || 0} daily_logs for user (showing latest 5):`);
      console.log(JSON.stringify(logsData, null, 2));
    }

    // Note: Removed habit_history table check - table doesn't exist in current schema
    // All habit data is stored in daily_logs table

    console.log('\n=== DAILY_LOGS TABLE STATISTICS ===');
    const { count, error: countError } = await supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (countError) {
      console.error('Error counting daily_logs:', countError);
    } else {
      console.log(`Total daily logs for user: ${count}`);
    }

    // Check for recent activity
    const { data: recentData, error: recentError } = await supabase
      .from('daily_logs')
      .select('log_date')
      .eq('user_id', user.id)
      .gte('log_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('log_date', { ascending: false });
    
    if (recentError) {
      console.error('Error fetching recent logs:', recentError);
    } else {
      console.log(`Logs in past 7 days: ${recentData?.length || 0}`);
      if (recentData?.length > 0) {
        console.log('Recent dates:', recentData.map(d => d.log_date).join(', '));
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugTables();
