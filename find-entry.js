// Simple check using browser console
// This can be run in your browser's developer console when on your app

console.log("🔍 Checking for 8/4 entry...");

// Function to check for recent entries
async function findRecentEntries() {
  try {
    // This assumes you're on your app and have access to the getAllDailyLogs function
    const { getAllDailyLogs } = await import('./src/lib/daily-logs');
    const logs = await getAllDailyLogs();
    
    console.log(`📊 Total logs found: ${logs?.length || 0}`);
    
    if (!logs || logs.length === 0) {
      console.log("❌ No logs found - might need to be authenticated");
      return;
    }
    
    // Look for 8/4 entries (both 2024-08-04 and 2024-8-4 formats)
    const aug4Entries = logs.filter(log => 
      log.log_date === '2024-08-04' || 
      log.log_date === '2024-8-4' ||
      log.log_date?.includes('8/4') ||
      log.log_date?.includes('08-04')
    );
    
    console.log(`🎯 Found ${aug4Entries.length} entries for 8/4:`);
    aug4Entries.forEach(entry => {
      console.log("📝 8/4 Entry:", entry);
    });
    
    // Also show most recent entries
    const recentLogs = logs
      .sort((a, b) => new Date(b.log_date || b.created_at) - new Date(a.log_date || a.created_at))
      .slice(0, 10);
    
    console.log("📅 Most recent 10 entries:");
    recentLogs.forEach(log => {
      console.log(`  ${log.log_date} - Created: ${log.created_at}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the check
findRecentEntries();