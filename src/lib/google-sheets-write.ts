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
  const year = date.getFullYear();

  // Return values in the exact order of your sheet columns (29 columns)
  // Columns: Year, Date, Day, Time Awake, Coffee, Breakfast, Time at Work, Time Left Work,
  // Netflix in Bed?, Phone 30min?, # Dabs, # Water Bottles, # Pages Read, Brush Teeth,
  // Wash Face, Green Tea, Drink, Smoke, Soda, Chocolate, Workout, Relax?, How was my Day?,
  // Weight, Calories, Latest Hype?, Dream, Bed Time, Morning walk
  return [
    year,                                          // 1. Year
    entry.date,                                    // 2. Date
    dayName,                                       // 3. Day
    entry.time_awake || '',                        // 4. Time Awake
    entry.coffee ? 'Yes' : 'No',                   // 5. Coffee
    entry.breakfast ? 'Yes' : 'No',                // 6. Breakfast
    entry.time_at_work || '',                      // 7. Time at Work
    entry.time_left_work || '',                    // 8. Time Left Work
    entry.netflix_in_bed ? 'Yes' : 'No',           // 9. Did I watch Netflix in Bed last Night?
    entry.phone_on_wake ? 'Yes' : 'No',            // 10. Did I use my phone for Social Media 30 mins after waking up?
    entry.dabs_count ?? 0,                         // 11. # of Dabs
    entry.water_bottles_count ?? 0,                // 12. # of Bottles of Water Drank?
    entry.pages_read_count ?? 0,                   // 13. Number of Pages Read
    entry.brushed_teeth_night ? 'Yes' : 'No',      // 14. Brush Teeth at Night
    entry.washed_face_night ? 'Yes' : 'No',        // 15. Wash Face at Night
    entry.green_tea ? 'Yes' : 'No',                // 16. Green Tea
    entry.alcohol ? 'Yes' : 'No',                  // 17. Drink
    entry.smoke ? 'Yes' : 'No',                    // 18. Smoke
    entry.soda ? 'Yes' : 'No',                     // 19. Soda
    entry.chocolate ? 'Yes' : 'No',                // 20. Chocolate
    Array.isArray(entry.workout) ? entry.workout.join(', ') : (entry.workout || 'No'), // 21. Workout
    entry.relaxed_today ? 'Yes' : 'No',            // 22. Relax?
    entry.day_rating || '',                        // 23. How was my Day?
    entry.weight_lbs ?? '',                        // 24. Weight in lbs
    entry.calories ?? '',                          // 25. # of Calories
    entry.latest_hype || '',                       // 26. Latest Hype?
    entry.dream || '',                             // 27. Dream I Had last night
    entry.bed_time || '',                          // 28. Bed Time
    entry.morning_walk ? 'Yes' : 'No',             // 29. Morning walk
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
    
    // Use text/plain to avoid CORS preflight - Google Apps Script handles this better
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
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
    // Use text/plain to avoid CORS preflight
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
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
    
    // Use text/plain to avoid CORS preflight - Google Apps Script handles this better
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
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

/**
 * Date range result interface
 */
export interface DateRangeRow {
  rowNumber: number;
  date: string;
  data: any[];
}

export interface DateRangeResult {
  success: boolean;
  rows: DateRangeRow[];
  headers: string[];
  count: number;
  error?: string;
}

/**
 * Fetch entries for a date range from Google Sheets
 * Used for historical data viewing (last 7 days)
 */
export async function getDateRange(startDate: string, endDate: string): Promise<DateRangeResult> {
  if (!isWriteConfigured()) {
    return {
      success: false,
      rows: [],
      headers: [],
      count: 0,
      error: 'Google Sheets webhook not configured',
    };
  }

  try {
    console.log('📥 Fetching date range:', { startDate, endDate });
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'getDateRange',
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error from webhook:', response.status, errorText);
      return {
        success: false,
        rows: [],
        headers: [],
        count: 0,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    
    if (result.error) {
      console.error('❌ Error from webhook:', result.error);
      return {
        success: false,
        rows: [],
        headers: [],
        count: 0,
        error: result.error,
      };
    }

    console.log(`✅ Fetched ${result.count} rows from date range`);
    return {
      success: true,
      rows: result.rows || [],
      headers: result.headers || [],
      count: result.count || 0,
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch date range:', error);
    return {
      success: false,
      rows: [],
      headers: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch a specific row by date
 */
export interface RowByDateResult {
  success: boolean;
  exists: boolean;
  rowNumber?: number;
  headers?: string[];
  data?: any[];
  error?: string;
}

export async function getRowByDate(date: string): Promise<RowByDateResult> {
  if (!isWriteConfigured()) {
    return {
      success: false,
      exists: false,
      error: 'Google Sheets webhook not configured',
    };
  }

  try {
    console.log('📥 Fetching row for date:', date);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'getRowByDate',
        date,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        exists: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    
    if (result.error) {
      return {
        success: false,
        exists: false,
        error: result.error,
      };
    }

    console.log(`✅ Row fetch result:`, result);
    return {
      success: true,
      exists: result.exists,
      rowNumber: result.rowNumber,
      headers: result.headers,
      data: result.data,
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch row:', error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing row (for editing)
 */
export async function updateRowByDate(entry: DailyLogEntry): Promise<{ success: boolean; rowNumber?: number; error?: string }> {
  if (!isWriteConfigured()) {
    return {
      success: false,
      error: 'Google Sheets webhook not configured',
    };
  }

  try {
    const rowData = formatRowForSheet(entry);
    
    console.log('📤 Updating row for date:', entry.date);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'updateRow',
        data: rowData,
        date: entry.date,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const result = await response.json();
    
    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    console.log('✅ Successfully updated row:', result);
    return {
      success: true,
      rowNumber: result.rowNumber,
    };
    
  } catch (error) {
    console.error('❌ Failed to update row:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse raw row data back to DailyLogEntry format
 * Maps array indices to entry fields based on column order
 */
export function parseRowToEntry(data: any[], headers: string[]): Partial<DailyLogEntry> {
  // Column mapping based on sheet structure
  // [Year, Date, Day, Time Awake, Coffee, Breakfast, ...]
  const entry: Partial<DailyLogEntry> = {};
  
  // Map by header names (normalized)
  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    headerMap[h.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')] = i;
  });
  
  // Helper to get value by header pattern
  const getValue = (patterns: string[]): any => {
    for (const p of patterns) {
      for (const [key, idx] of Object.entries(headerMap)) {
        if (key.includes(p)) {
          return data[idx];
        }
      }
    }
    return undefined;
  };
  
  // Parse date
  const dateVal = data[1] || data[headerMap['date']];
  if (dateVal) {
    if (typeof dateVal === 'string') {
      entry.date = dateVal;
    } else if (dateVal instanceof Date) {
      entry.date = dateVal.toISOString().split('T')[0];
    }
  }
  
  // Parse times
  entry.time_awake = getValue(['time_awake', 'awake']) || undefined;
  entry.time_at_work = getValue(['time_at_work', 'at_work']) || undefined;
  entry.time_left_work = getValue(['time_left_work', 'left_work']) || undefined;
  entry.bed_time = getValue(['bed_time', 'bedtime']) || undefined;
  
  // Parse booleans (Yes/No strings to boolean)
  const parseBool = (val: any): boolean | undefined => {
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'boolean') return val;
    const str = String(val).toLowerCase().trim();
    return str === 'yes' || str === 'true' || str === '1' || str === 'y';
  };
  
  entry.coffee = parseBool(getValue(['coffee']));
  entry.breakfast = parseBool(getValue(['breakfast']));
  entry.netflix_in_bed = parseBool(getValue(['netflix']));
  entry.phone_on_wake = parseBool(getValue(['phone', 'social_media']));
  entry.brushed_teeth_night = parseBool(getValue(['brush', 'teeth']));
  entry.washed_face_night = parseBool(getValue(['wash', 'face']));
  entry.green_tea = parseBool(getValue(['green_tea']));
  entry.alcohol = parseBool(getValue(['drink', 'alcohol']));
  entry.smoke = parseBool(getValue(['smoke']));
  entry.soda = parseBool(getValue(['soda']));
  entry.chocolate = parseBool(getValue(['chocolate']));
  entry.relaxed_today = parseBool(getValue(['relax']));
  entry.morning_walk = parseBool(getValue(['morning_walk', 'walk']));
  
  // Parse numbers
  const parseNum = (val: any): number | undefined => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  };
  
  entry.dabs_count = parseNum(getValue(['dabs', '_of_dabs']));
  entry.water_bottles_count = parseNum(getValue(['water', 'bottles']));
  entry.pages_read_count = parseNum(getValue(['pages', 'read']));
  entry.weight_lbs = parseNum(getValue(['weight']));
  entry.calories = parseNum(getValue(['calories']));
  
  // Parse text fields
  entry.workout = getValue(['workout']) || undefined;
  entry.day_rating = getValue(['day', 'how_was']) || undefined;
  entry.dream = getValue(['dream']) || undefined;
  entry.latest_hype = getValue(['hype', 'latest_hype']) || undefined;
  
  return entry;
}

/**
 * Validate date for forward entry
 * Returns true if date is valid (not more than 7 days in future)
 */
export function isValidForwardDate(dateStr: string, maxDaysAhead: number = 7): { valid: boolean; error?: string } {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (date > maxDate) {
    return { valid: false, error: `Cannot enter data more than ${maxDaysAhead} days ahead` };
  }
  
  return { valid: true };
}
