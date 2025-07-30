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
    
    console.log('=== CHECKING HABITS TABLE ===');
    const { data: habitsData, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .limit(10);
    
    if (habitsError) {
      console.error('Error fetching habits:', habitsError);
    } else {
      console.log(`Found ${habitsData?.length || 0} habits (showing first 5):`);
      console.log(JSON.stringify(habitsData, null, 2));
    }

    console.log('\n=== CHECKING DAILY_LOGS TABLE ===');
    const { data: logsData, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .limit(5);
    
    if (logsError) {
      console.error('Error fetching daily_logs:', logsError);
    } else {
      console.log(`Found ${logsData?.length || 0} daily_logs (showing first 5):`);
      console.log(JSON.stringify(logsData, null, 2));
    }

    console.log('\n=== CHECKING HABIT_HISTORY TABLE ===');
    const { data: historyData, error: historyError } = await supabase
      .from('habit_history')
      .select('*')
      .limit(5);
    
    if (historyError) {
      console.error('Error fetching habit_history:', historyError);
    } else {
      console.log(`Found ${historyData?.length || 0} habit_history entries (showing first 5):`);
      console.log(JSON.stringify(historyData, null, 2));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugTables();
