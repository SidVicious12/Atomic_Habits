/**
 * Google Sheets API Integration
 * Fetches habit data from Google Sheets using the Google Sheets API
 */

const GOOGLE_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '1Nlpar2t_3leYPqDsFz4IordiFE4-RBVUHHLT8ySJ3Y0';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_SHEET_NAME = import.meta.env.VITE_GOOGLE_SHEET_NAME || 'Sheet1';

// Log configuration on load
console.log('🔧 Google Sheets Config:', {
  sheetId: GOOGLE_SHEET_ID,
  sheetName: GOOGLE_SHEET_NAME,
  hasApiKey: !!GOOGLE_API_KEY
});

export interface DailyLog {
  [key: string]: string | number | boolean | undefined | null;
  id?: string;
  log_date: string;
  time_awake?: string;
  time_at_work?: string;
  time_left_work?: string;
  morning_walk?: boolean;
  coffee?: boolean;
  breakfast?: boolean;
  phone_on_wake?: boolean;
  water_bottles_count?: number;
  green_tea?: boolean;
  alcohol?: boolean;
  soda?: boolean;
  chocolate?: boolean;
  smoke?: boolean;
  dabs_count?: number;
  brushed_teeth_night?: boolean;
  washed_face_night?: boolean;
  netflix_in_bed?: boolean;
  workout?: boolean;
  calories?: number;
  pages_read_count?: number;
  relaxed_today?: boolean;
  day_rating?: number;
  weight_lbs?: number;
  created_at?: string;
}

/**
 * Get available sheet names from the spreadsheet
 */
async function getSheetNames(): Promise<string[]> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}?key=${GOOGLE_API_KEY}&fields=sheets.properties.title`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.sheets) {
      return data.sheets.map((s: any) => s.properties.title);
    }
    return [];
  } catch (error) {
    console.error('Error getting sheet names:', error);
    return [];
  }
}

/**
 * Fetch data from Google Sheets using the public API
 */
export async function fetchGoogleSheetsData(range?: string): Promise<any[]> {
  try {
    // First, get available sheet names
    const sheetNames = await getSheetNames();
    console.log('📋 Available sheets:', sheetNames);
    
    // Determine which sheet to use
    let sheetName = GOOGLE_SHEET_NAME;
    
    if (sheetNames.length > 0) {
      // Check if configured sheet exists (case-insensitive)
      const matchingSheet = sheetNames.find(
        (name: string) => name.toLowerCase() === GOOGLE_SHEET_NAME.toLowerCase()
      );
      
      if (matchingSheet) {
        sheetName = matchingSheet;
      } else {
        // Use the first available sheet
        sheetName = sheetNames[0];
        console.log(`⚠️ Sheet "${GOOGLE_SHEET_NAME}" not found. Using "${sheetName}" instead.`);
      }
    }
    
    const sheetRange = range || `'${sheetName}'!A:Z`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(sheetRange)}?key=${GOOGLE_API_KEY}`;
    
    console.log('📡 Fetching from Google Sheets:', { sheetName, sheetRange });

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Google Sheets API error:', response.status, data);
      throw new Error(data.error?.message || `Failed to fetch from Google Sheets: ${response.statusText}`);
    }

    console.log(`✅ Successfully fetched data from sheet "${sheetName}"`);
    return data.values || [];
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error);
    throw error;
  }
}

/**
 * Parse Google Sheets rows into DailyLog objects
 * Assumes first row is headers
 */
export function parseSheetData(rows: any[][]): DailyLog[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  // First row contains headers
  const headers = rows[0].map((h: string) => h.toLowerCase().trim().replace(/ /g, '_'));

  // Convert remaining rows to objects
  return rows.slice(1).map((row, index) => {
    const log: any = {};

    headers.forEach((header: string, colIndex: number) => {
      const value = row[colIndex];

      // Parse different data types
      if (value === undefined || value === null || value === '') {
        log[header] = null;
      } else if (header.includes('date')) {
        // Parse date fields
        log[header] = parseGoogleSheetsDate(value);
      } else if (header.includes('count') || header.includes('weight') || header.includes('calories') || header.includes('rating')) {
        // Parse numeric fields
        log[header] = parseFloat(value) || null;
      } else if (value === 'TRUE' || value === 'true' || value === '1' || value === 'yes' || value === 'Yes') {
        // Parse boolean fields
        log[header] = true;
      } else if (value === 'FALSE' || value === 'false' || value === '0' || value === 'no' || value === 'No') {
        log[header] = false;
      } else {
        log[header] = value;
      }
    });

    // Add synthetic ID
    log.id = `row_${index + 2}`; // +2 because index starts at 0 and we skip header

    return log as DailyLog;
  });
}

/**
 * Parse Google Sheets date format
 * Handles various date formats: YYYY-MM-DD, MM/DD/YYYY, etc.
 */
function parseGoogleSheetsDate(dateValue: string): string {
  if (!dateValue) return '';

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // Try to parse and convert to YYYY-MM-DD
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return dateValue;
}

/**
 * Main function to get all daily logs from Google Sheets
 */
export async function getAllDailyLogsFromSheets(): Promise<DailyLog[]> {
  try {
    console.log('📊 Fetching data from Google Sheets...');
    // Use default range (from env variable)
    const rows = await fetchGoogleSheetsData();

    if (!rows || rows.length === 0) {
      console.warn('⚠️ No data found in Google Sheets. Make sure your sheet is shared publicly and has data.');
      return [];
    }

    console.log(`✅ Fetched ${rows.length} rows from Google Sheets`);
    const logs = parseSheetData(rows);
    console.log(`✅ Parsed ${logs.length} daily logs`);
    
    if (logs.length > 0) {
      console.log('📋 Sample log:', logs[0]);
      console.log('📋 Available columns:', Object.keys(logs[0]));
    }

    return logs;
  } catch (error) {
    console.error('❌ Error loading data from Google Sheets:', error);
    throw error;
  }
}

/**
 * Get the most recent daily log
 */
export async function getLatestDailyLogFromSheets(): Promise<DailyLog | null> {
  try {
    const logs = await getAllDailyLogsFromSheets();
    if (logs.length === 0) return null;

    // Sort by date descending and return the first one
    const sortedLogs = logs.sort((a, b) =>
      new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    );

    return sortedLogs[0];
  } catch (error) {
    console.error('Error getting latest log:', error);
    return null;
  }
}
