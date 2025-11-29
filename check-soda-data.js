import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSodaData() {
  try {
    console.log('🥤 Checking soda data...');
    
    const targetUserId = process.env.TARGET_USER_ID || '1c68c1ef-c347-48e7-9824-75f92eafbca2';
    
    // Check soda data specifically
    const { data: sodaData, error: sodaError } = await supabase
      .from('daily_logs')
      .select('log_date, soda')
      .eq('user_id', targetUserId)
      .not('soda', 'is', null)
      .limit(10);
    
    if (sodaError) {
      console.error('❌ Error verifying soda data:', sodaError);
    } else {
      console.log('\n✅ Soda data verification:');
      console.log(`🥤 Found ${sodaData.length} entries with soda data`);
      sodaData.slice(0, 5).forEach(entry => {
        console.log(`  ${entry.log_date}: soda=${entry.soda}`);
      });
    }
    
    // Count totals for soda
    const { data: totalData, error: totalError } = await supabase
      .from('daily_logs')
      .select('soda')
      .eq('user_id', targetUserId);
    
    if (!totalError && totalData) {
      const totalCount = totalData.length;
      const trueCount = totalData.filter(d => d.soda === true).length;
      const falseCount = totalData.filter(d => d.soda === false).length;
      const nullCount = totalData.filter(d => d.soda === null).length;
      
      console.log('\n📊 Soda Statistics:');
      console.log(`  Total records: ${totalCount}`);
      console.log(`  True (had soda): ${trueCount}`);
      console.log(`  False (no soda): ${falseCount}`);
      console.log(`  NULL values: ${nullCount}`);
    }
    
  } catch (error) {
    console.error('❌ Check operation failed:', error);
  }
}

checkSodaData();