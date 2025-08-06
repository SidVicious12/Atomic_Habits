import { supabase } from './supabase';
import type { DailyLogFormData } from '@/components/DailyLogForm';

export interface ImportResult {
  success: number;
  errors: number;
  details: string[];
}

/**
 * Import historical data from JSON format into Supabase
 * Expected format: Array of objects with log_date and other fields
 */
export async function importHistoricalData(data: any[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    errors: 0,
    details: []
  };

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Process each record
  for (const record of data) {
    try {
      // Transform the record to match our database schema
      const transformedRecord = transformRecord(record, user.id);
      
      // Insert/update in database
      const { data: insertedData, error } = await supabase
        .from('daily_logs')
        .upsert(transformedRecord, { onConflict: 'user_id, log_date' })
        .select();

      if (error) {
        result.errors++;
        result.details.push(`Error importing ${record.log_date}: ${error.message}`);
        console.error('Import error:', error, 'Record:', transformedRecord);
      } else {
        result.success++;
        result.details.push(`Successfully imported ${record.log_date}`);
        console.log('Successfully imported:', insertedData);
      }
    } catch (err) {
      result.errors++;
      result.details.push(`Error processing ${record.log_date}: ${err}`);
    }
  }

  return result;
}

/**
 * Transform a record to match the database schema
 */
function transformRecord(record: any, userId: string): any {
  // Base record with user_id
  const transformed: any = {
    user_id: userId,
    log_date: record.log_date || record.date,
  };

  // Map common fields
  const fieldMappings = {
    // Morning fields
    'time_awake': record.time_awake,
    'coffee': transformBoolean(record.coffee),
    'morning_walk': transformBoolean(record.morning_walk),
    'breakfast': transformBoolean(record.breakfast),
    'phone_on_wake': transformBoolean(record.phone_on_wake),
    
    // Intake fields
    'water_bottles_count': transformNumber(record.water_bottles_count || record.water_bottles),
    'soda': transformBoolean(record.soda),
    'alcohol': transformBoolean(record.alcohol),
    'dabs_count': transformNumber(record.dabs_count || record.dabs),
    'smoke': transformBoolean(record.smoke),
    
    // Night fields
    'bed_time': record.bed_time,
    'netflix_in_bed': transformBoolean(record.netflix_in_bed),
    'brushed_teeth_night': transformBoolean(record.brushed_teeth_night || record.brushed_teeth),
    'washed_face_night': transformBoolean(record.washed_face_night || record.washed_face),
    
    // Fitness fields
    'workout': transformWorkout(record.workout),
    'calories': transformNumber(record.calories),
    
    // Wellness fields
    'day_rating': record.day_rating,
    'pages_read_count': transformNumber(record.pages_read_count || record.pages_read),
    'relaxed_today': transformBoolean(record.relaxed_today),
    
    // Metrics
    'weight_lbs': transformNumber(record.weight_lbs || record.weight),
    
    // Additional fields
    'green_tea': transformBoolean(record.green_tea),
    'chocolate': transformBoolean(record.chocolate),
    'dream': record.dream,
    'latest_hype': record.latest_hype,
  };

  // Add non-null fields to transformed record
  Object.entries(fieldMappings).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      transformed[key] = value;
    }
  });

  return transformed;
}

/**
 * Transform various boolean representations to actual boolean
 */
function transformBoolean(value: any): boolean | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'yes' || lower === '1') return true;
    if (lower === 'false' || lower === 'no' || lower === '0') return false;
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return null;
}

/**
 * Transform various number representations to actual number
 */
function transformNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Transform workout data
 */
function transformWorkout(value: any): string[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // Try to parse as JSON array, or split by comma
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  return null;
}

/**
 * Create sample data for testing
 */
export function createSampleData(): any[] {
  const today = new Date();
  const sampleData = [];
  
  // Create 7 days of sample data
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    sampleData.push({
      log_date: date.toISOString().split('T')[0],
      coffee: Math.random() > 0.3, // 70% chance
      morning_walk: Math.random() > 0.5, // 50% chance
      breakfast: Math.random() > 0.4, // 60% chance
      phone_on_wake: Math.random() > 0.6, // 40% chance
      water_bottles_count: Math.floor(Math.random() * 8) + 1, // 1-8 bottles
      pages_read_count: Math.floor(Math.random() * 20), // 0-20 pages
      day_rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
    });
  }
  
  return sampleData;
}

/**
 * Parse CSV data into JSON format for import
 */
export function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record: any = {};
    
    headers.forEach((header, index) => {
      if (values[index] !== undefined) {
        record[header] = values[index];
      }
    });
    
    data.push(record);
  }
  
  return data;
}