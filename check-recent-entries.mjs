#!/usr/bin/env node

/**
 * Check for recent daily log entries in Supabase
 * This script will look for the 8/4 entry and recent submissions
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (same as in your app)
const SUPABASE_URL = 'https://tgipfyfcidkipzlzjhgi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaXBmeWZjaWRraXB6bHpqaGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1OTk2MzQsImV4cCI6MjA0NjE3NTYzNH0.lIlvF_5V2fN7YhKhejBWQsxU2-hEw2PiKZ8D3qJdN7s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRecentEntries() {
  console.log('🔍 Checking recent daily log entries...');
  
  try {
    // Check for entries from August 2024
    const { data: augustEntries, error: augustError } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', '2024-08-01')
      .lte('log_date', '2024-08-31')
      .order('log_date', { ascending: false });
    
    if (augustError) {
      console.error('❌ Error fetching August entries:', augustError);
      return;
    }
    
    console.log(`📅 Found ${augustEntries?.length || 0} entries for August 2024:`);
    
    if (augustEntries && augustEntries.length > 0) {
      augustEntries.forEach(entry => {
        console.log(`  📝 ${entry.log_date} (user: ${entry.user_id?.substring(0, 8)}...)`);
        
        // Check specifically for 8/4 (2024-08-04)
        if (entry.log_date === '2024-08-04') {
          console.log('🎯 FOUND 8/4 ENTRY!');
          console.log('   Details:', JSON.stringify({
            log_date: entry.log_date,
            coffee: entry.coffee,
            breakfast: entry.breakfast,
            morning_walk: entry.morning_walk,
            water_bottles_count: entry.water_bottles_count,
            created_at: entry.created_at,
            updated_at: entry.updated_at
          }, null, 2));
        }
      });
    }
    
    // Also check for any very recent entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const { data: recentEntries, error: recentError } = await supabase
      .from('daily_logs')
      .select('*')
      .gte('log_date', sevenDaysAgoStr)
      .order('log_date', { ascending: false });
    
    if (recentError) {
      console.error('❌ Error fetching recent entries:', recentError);
      return;
    }
    
    console.log(`\n⏰ Recent entries (last 7 days): ${recentEntries?.length || 0}`);
    if (recentEntries && recentEntries.length > 0) {
      recentEntries.forEach(entry => {
        console.log(`  📝 ${entry.log_date} - Created: ${new Date(entry.created_at).toLocaleString()}`);
      });
    }
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`\n📊 Total entries in database: ${count}`);
    }
    
    // Check if we can identify the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (user) {
      console.log(`\n👤 Current user: ${user.id.substring(0, 8)}...`);
      
      // Get entries for current user only
      const { data: userEntries, error: userEntriesError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(10);
      
      if (!userEntriesError && userEntries) {
        console.log(`\n📋 Your recent entries (${userEntries.length}):`);
        userEntries.forEach(entry => {
          console.log(`  📅 ${entry.log_date} - Updated: ${new Date(entry.updated_at || entry.created_at).toLocaleString()}`);
        });
        
        // Check specifically for your 8/4 entry
        const aug4Entry = userEntries.find(entry => entry.log_date === '2024-08-04');
        if (aug4Entry) {
          console.log('\n🎯 YOUR 8/4 ENTRY FOUND!');
          console.log('Full details:', JSON.stringify(aug4Entry, null, 2));
        } else {
          console.log('\n❌ No 8/4 entry found for your user');
        }
      }
    } else {
      console.log('\n⚠️ No authenticated user found');
      console.log('Note: This script runs without authentication, so it can only see public data');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRecentEntries();