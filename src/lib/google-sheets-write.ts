/**
 * Google Sheets Write Service
 * 
 * Uses Google Apps Script as a webhook to append rows to your sheet.
 * This bypasses the need for OAuth while keeping your sheet secure.
 * 
 * SETUP:
 * 1. Go to script.google.com
 * 2. Create new project
 * 3. Paste the Apps Script code from GOOGLE_SHEETS_WRITE_SETUP.md
 * 4. Deploy as Web App (anyone can access)
 * 5. Copy the URL and add to .env as VITE_GOOGLE_SHEETS_WEBHOOK_URL
 */

const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

export interface DailyLogEntry {
  date: string;
  day?: string;
  time_awake?: string;
  coffee?: boolean;
  breakfast?: boolean;
  time_at_work?: string;
  time_left_work?: string;
  netflix_in_bed?: boolean;
  phone_on_wake?: boolean;
  dabs_count?: number;
  water_bottles_count?: number;
  pages_read_count?: number;
  brushed_teeth_night?: boolean;
  washed_face_night?: boolean;
  green_tea?: boolean;
  alcohol?: boolean;
  smoke?: boolean;
  soda?: boolean;
  chocolate?: boolean;
  workout?: string | string[];
  relaxed_today?: boolean;
  day_rating?: string;
  weight_lbs?: number;
  calories?: number;
  latest_hype?: string;
  dream?: string;
  bed_time?: string;
  morning_walk?: boolean;
}

/**
 * Check if write functionality is configured
 */
export function isWriteConfigured(): boolean {
  return !!WEBHOOK_URL && WEBHOOK_URL !== 'YOUR_APPS_SCRIPT_URL_HERE';
}

/**
 * Convert form data to the column format expected by Google Sheets
 * Adjust this mapping based on your actual sheet column order
 */
function formatRowForSheet(entry: DailyLogEntry): any[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(entry.date);
  const dayName = dayNames[date.getDay()];

  // Return values in the exact order of your sheet columns
  // Adjust this array to match your Google Sheet column order
  return [
    entry.date,                                    // Date
    dayName,                                       // Day
    entry.time_awake || '',                        // Time Awake
    entry.coffee ? 'Yes' : 'No',                   // Coffee
    entry.breakfast ? 'Yes' : 'No',                // Breakfast
    entry.time_at_work || '',                      // Time at Work
    entry.time_left_work || '',                    // Time Left Work
    entry.netflix_in_bed ? 'Yes' : 'No',           // Netflix in Bed?
    entry.phone_on_wake ? 'Yes' : 'No',            // Phone 30min after wake?
    entry.dabs_count ?? 0,                         // # of Dabs
    entry.water_bottles_count ?? 0,                // # of Water Bottles
    entry.pages_read_count ?? 0,                   // # of Pages Read
    entry.brushed_teeth_night ? 'Yes' : 'No',      // Brush Teeth at Night
    entry.washed_face_night ? 'Yes' : 'No',        // Wash Face at Night
    entry.green_tea ? 'Yes' : 'No',                // Green Tea
    entry.alcohol ? 'Yes' : 'No',                  // Drink (alcohol)
    entry.smoke ? 'Yes' : 'No',                    // Smoke
    entry.soda ? 'Yes' : 'No',                     // Soda
    entry.chocolate ? 'Yes' : 'No',                // Chocolate
    Array.isArray(entry.workout) ? entry.workout.join(', ') : (entry.workout || 'No'), // Workout
    entry.relaxed_today ? 'Yes' : 'No',            // Relax?
    entry.day_rating || '',                        // How was my day?
    entry.weight_lbs ?? '',                        // Weight in lbs
    entry.calories ?? '',                          // Calories
    entry.latest_hype || '',                       // Latest hype?
    entry.dream || '',                             // Dream I had
    entry.bed_time || '',                          // Bed time
    entry.morning_walk ? 'Yes' : 'No',             // Morning walk
  ];
}

/**
 * Append a new row to Google Sheets via Apps Script webhook
 * Always appends (never overwrites existing rows)
 */
export async function appendDailyLogToSheet(entry: DailyLogEntry): Promise<{ success: boolean; rowNumber?: number; error?: string }> {
  if (!isWriteConfigured()) {
    console.warn('⚠️ Google Sheets write not configured - VITE_GOOGLE_SHEETS_WEBHOOK_URL not set');
    return {
      success: false,
      error: 'Google Sheets write not configured. Set VITE_GOOGLE_SHEETS_WEBHOOK_URL in your .env file.',
    };
  }

  try {
    const rowData = formatRowForSheet(entry);
    
    console.log('📤 Appending to Google Sheets webhook:', { date: entry.date });
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'append',
        data: rowData,
        date: entry.date,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error from webhook:', response.status, errorText);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      };
    }

    const result = await response.json();
    
    if (result.error) {
      console.error('❌ Error from webhook:', result.error);
      return { success: false, error: result.error };
    }

    console.log('✅ Successfully appended row to Google Sheets:', result);
    return { success: true, rowNumber: result.rowNumber };
    
  } catch (error) {
    console.error('❌ Failed to append to Google Sheets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if a row already exists for a given date
 * Useful for upsert logic (update if exists, insert if not)
 */
export async function checkDateExists(date: string): Promise<{ exists: boolean; rowNumber?: number }> {
  if (!isWriteConfigured()) {
    return { exists: false };
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'checkDate',
        date: date,
      }),
    });

    const result = await response.json();
    return { exists: result.exists, rowNumber: result.rowNumber };
  } catch (error) {
    console.error('Error checking date:', error);
    return { exists: false };
  }
}

/**
 * Upsert a daily log - updates if exists for date, appends if not
 */
export async function upsertDailyLogToSheet(entry: DailyLogEntry): Promise<{ success: boolean; action: 'inserted' | 'updated'; rowNumber?: number; error?: string }> {
  if (!isWriteConfigured()) {
    console.warn('⚠️ Google Sheets write not configured - VITE_GOOGLE_SHEETS_WEBHOOK_URL not set');
    return {
      success: false,
      action: 'inserted',
      error: 'Google Sheets write not configured. Set VITE_GOOGLE_SHEETS_WEBHOOK_URL in your .env file.',
    };
  }

  try {
    const rowData = formatRowForSheet(entry);
    
    console.log('📤 Sending to Google Sheets webhook:', { date: entry.date, rowData });
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'upsert',
        data: rowData,
        date: entry.date,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error from webhook:', response.status, errorText);
      return {
        success: false,
        action: 'inserted',
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    
    if (result.error) {
      console.error('❌ Error from webhook:', result.error);
      return {
        success: false,
        action: 'inserted',
        error: result.error,
      };
    }

    console.log(`✅ Successfully ${result.action} row in Google Sheets:`, result);
    return { 
      success: true, 
      action: result.action,
      rowNumber: result.rowNumber 
    };
    
  } catch (error) {
    console.error('❌ Failed to upsert to Google Sheets:', error);
    return { 
      success: false, 
      action: 'inserted',
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
