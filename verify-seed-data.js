import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('❌ Missing required environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSeedData() {
  try {
    console.log('🔧 Fixing seed data for phone_on_wake...');
    
    const targetUserId = process.env.TARGET_USER_ID || '1c68c1ef-c347-48e7-9824-75f92eafbca2';
    
    // First, clear any existing data
    const { error: deleteError } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', targetUserId);
    
    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError);
      return;
    }
    
    console.log('✅ Cleared existing data');
    
    // Generate fresh test data with clear phone_on_wake values
    const seedData = [];
    
    // Use UTC dates to avoid timezone issues
    for (let year = 2024; year <= 2024; year++) {
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const logDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          
          const dayData = {
            user_id: targetUserId,
            log_date: logDate,
            
            // Morning habits
            morning_walk: Math.random() > 0.3,
            coffee: Math.random() > 0.2,
            breakfast: Math.random() > 0.25,
            phone_on_wake: Math.random() > 0.6, // 40% chance - this is a "bad" habit
            
            // Intake habits
            water_bottles_count: Math.floor(Math.random() * 8) + 2, // 2-10 bottles
            soda: Math.random() > 0.85, // 15% chance - occasional
            alcohol: Math.random() > 0.8, // 20% chance - occasional
            chocolate: Math.random() > 0.6, // 40% chance
            green_tea: Math.random() > 0.5, // 50% chance
            
            // Substances
            smoke: Math.random() > 0.9, // 10% chance - rare
            dabs_count: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0, // 0-3
            
            // Activities
            pages_read_count: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 5 : 0,
            workout: Math.random() > 0.6 ? ['cardio'] : [], // TEXT[] array
            relaxed_today: Math.random() > 0.4,
            
            // Night habits
            brushed_teeth_night: Math.random() > 0.2,
            washed_face_night: Math.random() > 0.3,
            netflix_in_bed: Math.random() > 0.5,
            
            // Metrics
            weight_lbs: 180 + (Math.random() - 0.5) * 10, // 175-185 range
            day_rating: (Math.floor(Math.random() * 5) + 1).toString(), // TEXT field
            calories: Math.floor(Math.random() * 800) + 1800, // 1800-2600
            
            created_at: new Date().toISOString(),
          };
          
          seedData.push(dayData);
        }
      }
    }
    
    console.log(`📊 Generated ${seedData.length} daily log entries`);
    
    // Check for duplicates
    const dates = seedData.map(d => d.log_date);
    const uniqueDates = [...new Set(dates)];
    if (dates.length !== uniqueDates.length) {
      console.log(`❌ Found ${dates.length - uniqueDates.length} duplicate dates!`);
      // Find duplicates
      const duplicates = dates.filter((date, index) => dates.indexOf(date) !== index);
      console.log('Duplicate dates:', [...new Set(duplicates)].slice(0, 5));
      return;
    } else {
      console.log('✅ No duplicate dates found');
    }
    
    // Insert data in smaller batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < seedData.length; i += batchSize) {
      const batch = seedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(batch, { 
          onConflict: 'user_id,log_date',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        console.error('❌ Error inserting batch:', error);
        console.error('Batch dates:', batch.map(b => b.log_date).slice(0, 3));
        throw error;
      }
      
      inserted += data.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}, total: ${inserted}`);
    }
    
    console.log(`🎉 Successfully created ${inserted} seed entries!`);
    
    // Verify phone_on_wake data specifically
    const { data: phoneData, error: phoneError } = await supabase
      .from('daily_logs')
      .select('log_date, phone_on_wake')
      .eq('user_id', targetUserId)
      .not('phone_on_wake', 'is', null)
      .limit(10);
    
    if (phoneError) {
      console.error('❌ Error verifying phone data:', phoneError);
    } else {
      console.log('\n✅ Phone on Wake data verification:');
      console.log(`📱 Found ${phoneData.length} entries with phone_on_wake data`);
      phoneData.slice(0, 5).forEach(entry => {
        console.log(`  ${entry.log_date}: phone_on_wake=${entry.phone_on_wake}`);
      });
    }
    
    // Count totals
    const { data: totalData, error: totalError } = await supabase
      .from('daily_logs')
      .select('phone_on_wake')
      .eq('user_id', targetUserId);
    
    if (!totalError && totalData) {
      const totalCount = totalData.length;
      const trueCount = totalData.filter(d => d.phone_on_wake === true).length;
      const falseCount = totalData.filter(d => d.phone_on_wake === false).length;
      const nullCount = totalData.filter(d => d.phone_on_wake === null).length;
      
      console.log('\n📊 Phone on Wake Statistics:');
      console.log(`  Total records: ${totalCount}`);
      console.log(`  True (used phone): ${trueCount}`);
      console.log(`  False (didn't use phone): ${falseCount}`);
      console.log(`  NULL values: ${nullCount}`);
    }
    
  } catch (error) {
    console.error('❌ Fix operation failed:', error);
  }
}

fixSeedData();