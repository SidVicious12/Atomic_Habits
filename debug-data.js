import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing environment variables. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  try {
    console.log('\n🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data: healthData, error: healthError } = await supabase
      .from('daily_logs')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.log('❌ Connection failed:', healthError.message);
      return;
    }

    console.log('✅ Successfully connected to Supabase');
    
    // Get actual count
    const { count, error: countError } = await supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error getting count:', countError.message);
      return;
    }
    
    console.log('📊 Total records in daily_logs table:', count || 0);

    // Check for authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else if (!user) {
      console.log('❌ No authenticated user found');
      console.log('💡 You need to log in to the app first');
    } else {
      console.log('✅ Found authenticated user:', user.email);
      
      // Get user's data
      const { data: userData, error: userError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(5);

      if (userError) {
        console.log('❌ Error fetching user data:', userError.message);
      } else {
        console.log('📈 User has', userData?.length || 0, 'daily log entries');
        if (userData && userData.length > 0) {
          console.log('📅 Latest entry:', userData[0].log_date);
          console.log('📅 Earliest shown:', userData[userData.length - 1].log_date);
          console.log('\n🔍 Sample data (latest entry):');
          console.log({
            date: userData[0].log_date,
            coffee: userData[0].coffee,
            morning_walk: userData[0].morning_walk,
            phone_on_wake: userData[0].phone_on_wake,
          });
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

debugDatabase();