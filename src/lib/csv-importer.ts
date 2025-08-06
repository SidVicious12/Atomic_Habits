import { supabase } from './supabase';

interface CSVRow {
  [key: string]: string;
}

interface DatabaseRow {
  log_date: string;
  user_id?: string;
  coffee?: boolean;
  morning_walk?: boolean;
  breakfast?: boolean;
  green_tea?: boolean;
  alcohol?: boolean;
  smoke?: boolean;
  soda?: boolean;
  chocolate?: boolean;
  dabs_count?: number;
  water_bottles_count?: number;
  pages_read_count?: number;
  brushed_teeth_night?: boolean;
  washed_face_night?: boolean;
  netflix_in_bed?: boolean;
  phone_on_wake?: boolean;
  workout?: string[];
  relaxed_today?: boolean;
  day_rating?: string;
  weight_lbs?: number;
  calories?: number;
  time_awake?: string;
  bed_time?: string;
  dream?: string;
  latest_hype?: string;
}

/**
 * CSV Import Configuration
 * Maps CSV column names to database field names and transformation functions
 */
const CSV_FIELD_MAPPING = {
  // Date field - convert MM/DD/YYYY to YYYY-MM-DD
  'Date': {
    dbField: 'log_date',
    transform: (value: string): string => {
      if (!value) return '';
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (e) {
        console.warn('Invalid date format:', value);
        return '';
      }
    }
  },

  // Boolean fields - convert "Yes"/"No" to true/false
  'Coffee': { dbField: 'coffee', transform: convertYesNoToBoolean },
  'Breakfast': { dbField: 'breakfast', transform: convertYesNoToBoolean },
  'Green Tea': { dbField: 'green_tea', transform: convertYesNoToBoolean },
  'Drink': { dbField: 'alcohol', transform: convertYesNoToBoolean },
  'Smoke': { dbField: 'smoke', transform: convertYesNoToBoolean },
  'Soda': { dbField: 'soda', transform: convertYesNoToBoolean },
  'Chocolate': { dbField: 'chocolate', transform: convertYesNoToBoolean },
  'Brush Teeth at Night': { dbField: 'brushed_teeth_night', transform: convertYesNoToBoolean },
  'Wash Face at Night': { dbField: 'washed_face_night', transform: convertYesNoToBoolean },
  'Did I watch Netflix in Bed last Night?': { dbField: 'netflix_in_bed', transform: convertYesNoToBoolean },
  'Did I use my phone for Social Media 30 mins after waking up? ': { dbField: 'phone_on_wake', transform: convertYesNoToBoolean },
  'Relax?': { dbField: 'relaxed_today', transform: convertYesNoToBoolean },
  'Morning walk': { dbField: 'morning_walk', transform: convertYesNoToBoolean },

  // Numeric fields - convert strings to numbers
  '# of Dabs': { dbField: 'dabs_count', transform: convertToNumberOrNull },
  '# of Bottles of Water Drank? ': { dbField: 'water_bottles_count', transform: convertToNumberOrNull },
  'Number of Pages Read ': { dbField: 'pages_read_count', transform: convertToNumberOrNull },
  'Weight in lbs': { dbField: 'weight_lbs', transform: convertToNumberOrNull },
  '# of Calories': { dbField: 'calories', transform: convertToNumberOrNull },

  // Workout field - convert workout descriptions to array of strings
  'Workout': {
    dbField: 'workout',
    transform: (value: string): string[] => {
      const cleanValue = value?.trim() || '';
      
      // If no workout or "No" or "No workout", return empty array
      if (!cleanValue || cleanValue.toLowerCase() === 'no' || cleanValue.toLowerCase() === 'no workout') {
        return [];
      }
      
      // Parse workout descriptions into array
      // Examples: "Ran, Legs, Abs" -> ["Ran", "Legs", "Abs"]
      //           "Chest" -> ["Chest"]
      //           "Stairs, Back, Abs" -> ["Stairs", "Back", "Abs"]
      const workouts = cleanValue
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0)
        .map(w => {
          // Clean up common workout names
          const cleaned = w.replace(/\s+/g, ' ').trim();
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
        });
      
      return workouts.length > 0 ? workouts : [];
    }
  },

  // Text fields - clean and convert with length limits
  'How was my Day? ': { 
    dbField: 'day_rating', 
    transform: (value: string): string | null => {
      const cleaned = value?.trim();
      if (!cleaned || cleaned.toLowerCase() === 'great') {
        return cleaned || null;
      }
      // Limit to reasonable length
      return cleaned.length > 100 ? cleaned.substring(0, 100) : cleaned;
    }
  },
  'Time Awake': { 
    dbField: 'time_awake', 
    transform: (value: string): string | null => {
      const cleaned = value?.trim();
      if (!cleaned) return null;
      
      // Convert time format from "7:30:00 AM" to "07:30:00" (24-hour format)
      try {
        const timeMatch = cleaned.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const seconds = timeMatch[3];
          const ampm = timeMatch[4].toUpperCase();
          
          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
        }
        return cleaned.length > 20 ? cleaned.substring(0, 20) : cleaned;
      } catch (e) {
        return null;
      }
    }
  },
  'Bed Time': { 
    dbField: 'bed_time', 
    transform: (value: string): string | null => {
      const cleaned = value?.trim();
      if (!cleaned) return null;
      
      // Convert time format from "12:00:00 AM" to "00:00:00" (24-hour format)
      try {
        const timeMatch = cleaned.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2];
          const seconds = timeMatch[3];
          const ampm = timeMatch[4].toUpperCase();
          
          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          
          return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
        }
        return cleaned.length > 20 ? cleaned.substring(0, 20) : cleaned;
      } catch (e) {
        return null;
      }
    }
  },
  'Dream I Had last night': { 
    dbField: 'dream', 
    transform: (value: string): string | null => {
      const cleaned = value?.trim();
      if (!cleaned) return null;
      // Limit dream text to 500 characters to prevent database issues
      return cleaned.length > 500 ? cleaned.substring(0, 500) + '...' : cleaned;
    }
  },
  'Latest Hype?': { 
    dbField: 'latest_hype', 
    transform: (value: string): string | null => {
      const cleaned = value?.trim();
      if (!cleaned) return null;
      // Limit hype text to 1000 characters to prevent database issues
      return cleaned.length > 1000 ? cleaned.substring(0, 1000) + '...' : cleaned;
    }
  }
};

/**
 * Helper function to convert "Yes"/"No" strings to boolean
 */
function convertYesNoToBoolean(value: string): boolean | null {
  if (!value) return null;
  const cleanValue = value.trim().toLowerCase();
  if (cleanValue === 'yes') return true;
  if (cleanValue === 'no') return false;
  return null;
}

/**
 * Helper function to convert string numbers to actual numbers
 */
function convertToNumberOrNull(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value.trim());
  return isNaN(num) ? null : num;
}

/**
 * Parse CSV content into rows
 */
function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header row
  const headers = lines[0].split(',').map(header => header.trim());
  console.log('📋 CSV Headers found:', headers);

  // Parse data rows
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`⚠️  Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
      continue;
    }

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  console.log(`✅ Parsed ${rows.length} data rows from CSV`);
  return rows;
}

/**
 * Parse a single CSV line handling commas inside quotes
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Transform CSV row to database row format
 */
function transformCSVRow(csvRow: CSVRow): any | null {
  const dbRow: any = {};
  let hasData = false;

  // Process each CSV field according to mapping
  for (const [csvField, mapping] of Object.entries(CSV_FIELD_MAPPING)) {
    const csvValue = csvRow[csvField];
    if (csvValue !== undefined && csvValue !== null) {
      try {
        const transformedValue = mapping.transform(csvValue);
        if (transformedValue !== null && transformedValue !== undefined && transformedValue !== '') {
          dbRow[mapping.dbField] = transformedValue;
          if (mapping.dbField !== 'log_date') {
            hasData = true;
          }
        }
      } catch (error) {
        console.warn(`❌ Error transforming field ${csvField} with value "${csvValue}":`, error);
      }
    }
  }

  // Must have a valid date to be importable
  if (!dbRow.log_date) {
    console.warn('❌ Row missing log_date:', csvRow);
    return null;
  }

  // Must have at least one data field besides the date
  if (!hasData) {
    console.warn('❌ Row has no data besides date:', dbRow.log_date);
    return null;
  }

  return dbRow;
}

/**
 * Import CSV data into Supabase
 */
export async function importCSVToSupabase(csvContent: string): Promise<{
  success: boolean;
  imported: number;
  errors: string[];
  summary: any;
}> {
  console.log('🚀 Starting CSV import process...');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  console.log('👤 User authenticated:', user.id);

  const errors: string[] = [];
  let imported = 0;

  try {
    // Parse CSV
    const csvRows = parseCSV(csvContent);
    if (csvRows.length === 0) {
      return { success: false, imported: 0, errors: ['No data found in CSV'], summary: {} };
    }

    console.log(`📊 Processing ${csvRows.length} rows...`);

      // Transform and batch insert
    const batchSize = 25; // Smaller batches for better error handling
    const validRows: any[] = []; // Use any[] to avoid type issues

    // Transform all rows
    for (let i = 0; i < csvRows.length; i++) {
      const csvRow = csvRows[i];
      const dbRow = transformCSVRow(csvRow);
      
      if (dbRow && dbRow.log_date) {
        // Create a clean record with user_id
        const finalRow = {
          user_id: user.id,
          log_date: dbRow.log_date,
          ...Object.fromEntries(
            Object.entries(dbRow)
              .filter(([key, value]) => 
                key !== 'log_date' && 
                value !== null && 
                value !== undefined && 
                value !== ''
              )
          )
        };
        
        validRows.push(finalRow);
      } else {
        errors.push(`Row ${i + 2}: Could not transform data or missing date`);
      }
    }

    console.log(`✅ Transformed ${validRows.length} valid rows`);
    
    if (validRows.length > 0) {
      console.log('🔍 Sample transformed row:', JSON.stringify(validRows[0], null, 2));
      console.log('📋 Row structure validation:');
      const sampleRow = validRows[0];
      console.log('  - user_id:', typeof sampleRow.user_id, sampleRow.user_id);
      console.log('  - log_date:', typeof sampleRow.log_date, sampleRow.log_date);
      console.log('  - has other fields:', Object.keys(sampleRow).filter(k => k !== 'user_id' && k !== 'log_date').length);
    }

    // Insert in batches with proper error handling
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`🔄 Processing batch ${batchNumber}: ${batch.length} records`);
      console.log('Sample batch record:', JSON.stringify(batch[0], null, 2));
      
      try {
        // Ensure all records have required fields and proper data types
        const cleanBatch = batch.map((record, index) => {
          const cleanRecord = { user_id: record.user_id, log_date: record.log_date };
          
          // Validate required fields
          if (!cleanRecord.user_id || !cleanRecord.log_date) {
            throw new Error(`Record ${index}: Missing required fields: user_id=${cleanRecord.user_id}, log_date=${cleanRecord.log_date}`);
          }
          
          // Process each field with type validation
          Object.keys(record).forEach(key => {
            if (key === 'user_id' || key === 'log_date') return; // Already handled
            
            const value = record[key];
            if (value === undefined || value === null || value === '') return;
            
            try {
              // Type validation based on field
              if (['coffee', 'breakfast', 'green_tea', 'alcohol', 'smoke', 'soda', 'chocolate',
                   'brushed_teeth_night', 'washed_face_night', 'netflix_in_bed', 'phone_on_wake',
                   'relaxed_today', 'morning_walk'].includes(key)) {
                // Boolean fields
                cleanRecord[key] = Boolean(value);
              } else if (key === 'workout') {
                // Workout is an array field
                if (Array.isArray(value)) {
                  cleanRecord[key] = value;
                } else {
                  console.warn(`⚠️  Workout field should be array, got:`, typeof value, value);
                }
              } else if (['dabs_count', 'water_bottles_count', 'pages_read_count', 'weight_lbs', 'calories'].includes(key)) {
                // Numeric fields - ensure they're valid numbers
                const num = Number(value);
                if (!isNaN(num) && isFinite(num)) {
                  cleanRecord[key] = num;
                }
              } else if (['time_awake', 'bed_time'].includes(key)) {
                // Time fields - validate format
                const timeStr = String(value);
                if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
                  cleanRecord[key] = timeStr;
                }
              } else if (['day_rating', 'dream', 'latest_hype'].includes(key)) {
                // Text fields - ensure they're strings and not too long
                const textValue = String(value);
                if (textValue.length > 0) {
                  cleanRecord[key] = textValue;
                }
              }
            } catch (fieldError) {
              console.warn(`⚠️  Skipping problematic field ${key} in record ${index}:`, fieldError);
            }
          });
          
          return cleanRecord;
        });
        
        console.log(`🧹 Cleaned batch ${batchNumber}: ${cleanBatch.length} records`);
        
        // Try inserting just one record first for debugging
        if (batchNumber === 1) {
          console.log('🧪 Testing single record insert first...');
          const testRecord = cleanBatch[0];
          
          // For first test, try with minimal fields to isolate the issue
          const minimalRecord = {
            user_id: testRecord.user_id,
            log_date: testRecord.log_date,
            coffee: testRecord.coffee,
            breakfast: testRecord.breakfast
          };
          
          // Ensure workout is an array if present
          if (testRecord.workout !== undefined) {
            if (Array.isArray(testRecord.workout)) {
              minimalRecord.workout = testRecord.workout;
            } else {
              console.log('🔧 Converting workout to array format');
              minimalRecord.workout = [];
            }
          }
          
          console.log('🔍 Testing minimal record:', minimalRecord);
          
          const { data: testData, error: testError } = await supabase
            .from('daily_logs')
            .upsert([minimalRecord], { 
              onConflict: 'user_id,log_date',
              ignoreDuplicates: false 
            })
            .select('log_date');
            
          if (testError) {
            console.error('🚨 Minimal record test failed:', testError);
            throw new Error(`Minimal record test failed: ${testError.message}`);
          } else {
            console.log('✅ Minimal record test passed, trying full record...');
            
            // Now try the full record
            const { data: fullTestData, error: fullTestError } = await supabase
              .from('daily_logs')
              .upsert([testRecord], { 
                onConflict: 'user_id,log_date',
                ignoreDuplicates: false 
              })
              .select('log_date');
              
            if (fullTestError) {
              console.error('🚨 Full record test failed:', fullTestError);
              console.log('🔍 Problematic fields might be:', Object.keys(testRecord).filter(k => !['user_id', 'log_date', 'coffee', 'breakfast'].includes(k)));
              throw new Error(`Full record test failed: ${fullTestError.message}`);
            } else {
              console.log('✅ Full record test passed:', fullTestData);
            }
          }
        }
        
        const { data, error } = await supabase
          .from('daily_logs')
          .upsert(cleanBatch, { 
            onConflict: 'user_id,log_date',
            ignoreDuplicates: false 
          })
          .select('log_date');

        if (error) {
          console.error(`❌ Batch ${batchNumber} failed:`, error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          errors.push(`Batch ${batchNumber}: ${error.message} (${error.code || 'unknown'})`);
        } else {
          const importedCount = data?.length || batch.length;
          imported += importedCount;
          console.log(`✅ Batch ${batchNumber}: Successfully imported ${importedCount} records`);
          
          if (data && data.length > 0) {
            console.log(`📅 Date range in batch: ${data[0].log_date} to ${data[data.length - 1].log_date}`);
          }
        }
      } catch (batchError) {
        console.error(`💥 Batch ${batchNumber} exception:`, batchError);
        errors.push(`Batch ${batchNumber}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < validRows.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Generate summary
    const summary = {
      totalRowsProcessed: csvRows.length,
      validRowsFound: validRows.length,
      recordsImported: imported,
      errorsCount: errors.length,
      dateRange: validRows.length > 0 ? {
        earliest: validRows.reduce((min, row) => row.log_date < min ? row.log_date : min, validRows[0].log_date),
        latest: validRows.reduce((max, row) => row.log_date > max ? row.log_date : max, validRows[0].log_date)
      } : null
    };

    console.log('📈 Import Summary:', summary);

    return {
      success: imported > 0,
      imported,
      errors,
      summary
    };

  } catch (error) {
    console.error('💥 Import failed:', error);
    return {
      success: false,
      imported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      summary: {}
    };
  }
}

/**
 * Import from file path (for development/testing)
 */
export async function importCSVFromFile(filePath: string): Promise<any> {
  try {
    // Note: This would need to be implemented with file reading in a real environment
    // For now, this is a placeholder for the concept
    console.log('📁 Would import from file:', filePath);
    return { success: false, error: 'File import not implemented in browser environment' };
  } catch (error) {
    console.error('❌ File import failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}