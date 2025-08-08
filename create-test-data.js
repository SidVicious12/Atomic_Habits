import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestData() {
  console.log('🔍 Checking authentication...');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('❌ No authenticated user found.');
    console.log('💡 Please log in to the app first, then run this script.');
    process.exit(1);
  }
  
  console.log('✅ Found user:', user.email);
  console.log('📝 Creating test data...');
  
  // Create 30 days of sample data
  const testData = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    testData.push({
      user_id: user.id,
      log_date: date.toISOString().split('T')[0],
      coffee: Math.random() > 0.3, // 70% chance of coffee
      morning_walk: Math.random() > 0.5, // 50% chance of walk
      breakfast: Math.random() > 0.4, // 60% chance of breakfast
      phone_on_wake: Math.random() > 0.7, // 30% chance of phone (bad habit)
      water_bottles_count: Math.floor(Math.random() * 8) + 2, // 2-10 bottles
      pages_read_count: Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 5 : 0, // 0 or 5-55 pages
      brushed_teeth_night: Math.random() > 0.2, // 80% chance
      washed_face_night: Math.random() > 0.3, // 70% chance
      day_rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(testData, { onConflict: 'user_id, log_date' })
      .select();
    
    if (error) {
      console.log('❌ Error creating test data:', error.message);
      return;
    }
    
    console.log('✅ Successfully created', data.length, 'test entries!');
    console.log('🎉 Your dashboards should now show data.');
    console.log('📊 Visit your app to see the charts populated with sample data.');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

createTestData();