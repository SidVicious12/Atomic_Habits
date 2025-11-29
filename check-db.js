import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    // Get total count with service role (bypasses RLS)
    const { data, error, count } = await supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📊 Total records in database: ${count}`);
    
    if (count > 0) {
      // Get a few sample records
      const { data: samples } = await supabase
        .from('daily_logs')
        .select('user_id, log_date, phone_on_wake')
        .limit(5);
      
      console.log('\n📋 Sample records:');
      samples.forEach(record => {
        console.log(`  ${record.log_date} (${record.user_id.slice(0,8)}...): phone_on_wake=${record.phone_on_wake}`);
      });
      
      // Clear all data
      console.log('\n🗑️ Clearing all data...');
      const { error: deleteError } = await supabase
        .from('daily_logs')
        .delete()
        .neq('user_id', 'impossible-id'); // Delete all records
      
      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
      } else {
        console.log('✅ All data cleared');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabase();