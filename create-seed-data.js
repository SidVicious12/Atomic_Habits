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

// Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSeedData() {
  try {
    console.log('🌱 Creating seed data for dashboard testing...');
    
    const targetUserId = process.env.TARGET_USER_ID || '1c68c1ef-c347-48e7-9824-75f92eafbca2';
    
    // Generate 3 months of test data (February - April 2025)
    const seedData = [];
    const startDate = new Date('2025-02-01');
    const endDate = new Date('2025-04-30');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      
      // Skip some days to make it realistic (70% completion rate)
      if (Math.random() > 0.7) continue;
      
      const dayData = {
        user_id: targetUserId,
        log_date: currentDate.toISOString().split('T')[0],
        
        // Morning habits (70% consistency)
        morning_walk: Math.random() > 0.3,
        coffee: Math.random() > 0.2,
        phone_on_wake: Math.random() > 0.4, // Bad habit - 60% rate
        
        // Intake habits
        water_bottles_count: Math.floor(Math.random() * 8) + 2, // 2-10 bottles
        breakfast: Math.random() > 0.25,
        green_tea: Math.random() > 0.5,
        alcohol: Math.random() > 0.8, // Occasional
        smoke: Math.random() > 0.9, // Rare
        soda: Math.random() > 0.85, // Occasional
        chocolate: Math.random() > 0.6,
        dabs_count: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
        
        // Night habits
        brushed_teeth_night: Math.random() > 0.2,
        washed_face_night: Math.random() > 0.3,
        netflix_in_bed: Math.random() > 0.5, // Bad habit
        
        // Wellness
        relaxed_today: Math.random() > 0.4,
        pages_read_count: Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 5 : 0,
        workout: Math.random() > 0.6 ? ['cardio'] : [], // TEXT[] array
        
        // Metrics
        weight_lbs: 180 + (Math.random() - 0.5) * 10, // 175-185 range
        day_rating: (Math.floor(Math.random() * 5) + 1).toString(), // TEXT field
        calories: Math.floor(Math.random() * 800) + 1800, // 1800-2600
        
        created_at: new Date().toISOString(),
      };
      
      seedData.push(dayData);
    }
    
    console.log(`📊 Generated ${seedData.length} daily log entries`);
    
    // Insert data in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < seedData.length; i += batchSize) {
      const batch = seedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('daily_logs')
        .upsert(batch, { onConflict: 'user_id, log_date' })
        .select();
      
      if (error) {
        console.error('❌ Error inserting batch:', error);
        throw error;
      }
      
      inserted += data.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}, total: ${inserted}`);
    }
    
    console.log(`🎉 Successfully created ${inserted} seed entries!`);
    
    // Verify the data
    const { data: verification, error: verifyError } = await supabase
      .from('daily_logs')
      .select('log_date, morning_walk, coffee, water_bottles_count')
      .eq('user_id', targetUserId)
      .order('log_date', { ascending: false })
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
    } else {
      console.log('\n✅ Data verification - Latest 5 entries:');
      verification.forEach(entry => {
        console.log(`  ${entry.log_date}: walk=${entry.morning_walk}, coffee=${entry.coffee}, water=${entry.water_bottles_count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Seed data creation failed:', error);
  }
}

createSeedData();