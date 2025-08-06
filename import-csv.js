#!/usr/bin/env node

/**
 * Direct CSV Import Script for Daily's (Yearly) - Sheet1.csv
 * 
 * This script directly imports your CSV file into Supabase.
 * Run with: node import-csv.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CSV_FILE_PATH = '/Users/SidVicious/Downloads/Daily\'s (Yearly) - Sheet1.csv';
const SUPABASE_URL = 'https://tgipfyfcidkipzlzjhgi.supabase.co'; // Replace with your actual URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnaXBmeWZjaWRraXB6bHpqaGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1OTk2MzQsImV4cCI6MjA0NjE3NTYzNH0.lIlvF_5V2fN7YhKhejBWQsxU2-hEw2PiKZ8D3qJdN7s'; // Replace with your actual anon key

// Field mapping from CSV to database
const FIELD_MAPPING = {
  'Date': 'log_date',
  'Coffee': 'coffee',
  'Breakfast': 'breakfast',
  'Green Tea': 'green_tea', 
  'Drink': 'alcohol',
  'Smoke': 'smoke',
  'Soda': 'soda',
  'Chocolate': 'chocolate',
  '# of Dabs': 'dabs_count',
  '# of Bottles of Water Drank? ': 'water_bottles_count',
  'Number of Pages Read ': 'pages_read_count',
  'Brush Teeth at Night': 'brushed_teeth_night',
  'Wash Face at Night': 'washed_face_night',
  'Did I watch Netflix in Bed last Night?': 'netflix_in_bed',
  'Did I use my phone for Social Media 30 mins after waking up? ': 'phone_on_wake',
  'Relax?': 'relaxed_today',
  'Morning walk': 'morning_walk',
  'Workout': 'workout',
  'How was my Day? ': 'day_rating',
  'Weight in lbs': 'weight_lbs',
  '# of Calories': 'calories',
  'Time Awake': 'time_awake',
  'Bed Time': 'bed_time',
  'Dream I Had last night': 'dream',
  'Latest Hype?': 'latest_hype'
};

// Helper functions
function convertYesNoToBoolean(value) {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  if (clean === 'yes') return true;
  if (clean === 'no') return false;
  return null;
}

function convertToNumber(value) {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value.trim());
  return isNaN(num) ? null : num;
}

function convertDate(value) {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch (e) {
    return null;
  }
}

function parseCSVLine(line) {
  const values = [];
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

function transformCSVRow(csvRow, headers) {
  const dbRow = {};
  let hasData = false;

  // Process each field
  for (let i = 0; i < headers.length; i++) {
    const csvField = headers[i];
    const csvValue = csvRow[i] || '';
    const dbField = FIELD_MAPPING[csvField];

    if (!dbField) continue;

    let transformedValue = null;

    if (dbField === 'log_date') {
      transformedValue = convertDate(csvValue);
    } else if (['coffee', 'breakfast', 'green_tea', 'alcohol', 'smoke', 'soda', 'chocolate', 
               'brushed_teeth_night', 'washed_face_night', 'netflix_in_bed', 'phone_on_wake', 
               'relaxed_today', 'morning_walk'].includes(dbField)) {
      transformedValue = convertYesNoToBoolean(csvValue);
    } else if (['dabs_count', 'water_bottles_count', 'pages_read_count', 'weight_lbs', 'calories'].includes(dbField)) {
      transformedValue = convertToNumber(csvValue);
    } else if (dbField === 'workout') {
      const cleanValue = csvValue?.trim().toLowerCase() || '';
      transformedValue = cleanValue !== '' && cleanValue !== 'no workout' && cleanValue !== 'no';
    } else {
      // Text fields
      transformedValue = csvValue?.trim() || null;
    }

    if (transformedValue !== null && transformedValue !== undefined && transformedValue !== '') {
      dbRow[dbField] = transformedValue;
      hasData = true;
    }
  }

  return hasData && dbRow.log_date ? dbRow : null;
}

async function importCSV() {
  console.log('🚀 Starting CSV import...');
  
  // Check if file exists
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error('❌ CSV file not found:', CSV_FILE_PATH);
    process.exit(1);
  }

  // Read CSV file
  console.log('📖 Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.error('❌ CSV file appears to be empty or invalid');
    process.exit(1);
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  console.log('📋 Found', headers.length, 'columns');
  console.log('🔍 Mapped fields:', Object.keys(FIELD_MAPPING).filter(key => headers.includes(key)).length);

  // Parse data rows
  const validRows = [];
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const dbRow = transformCSVRow(values, headers);
    
    if (dbRow) {
      validRows.push(dbRow);
    } else {
      errorCount++;
    }
  }

  console.log('✅ Processed', lines.length - 1, 'rows');
  console.log('✅ Valid rows:', validRows.length);
  console.log('⚠️  Skipped rows:', errorCount);

  if (validRows.length === 0) {
    console.error('❌ No valid data found to import');
    process.exit(1);
  }

  // Show date range
  const dates = validRows.map(row => row.log_date).sort();
  console.log('📅 Date range:', dates[0], 'to', dates[dates.length - 1]);

  // Show sample data
  console.log('\n📊 Sample data (first 3 rows):');
  validRows.slice(0, 3).forEach((row, i) => {
    console.log(`Row ${i + 1}:`, JSON.stringify(row, null, 2));
  });

  console.log('\n🎯 Ready to import', validRows.length, 'records');
  console.log('\n⚠️  IMPORTANT: Make sure you are logged into your Supabase account in the browser');
  console.log('   This script cannot authenticate directly - use the web import instead.');
  console.log('\n📝 Copy this data structure to use in the web import:');
  
  // Generate import-ready JSON
  const importData = {
    totalRecords: validRows.length,
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
    sampleData: validRows.slice(0, 5),
    message: 'Use the Import page in your web app to import this data'
  };

  // Write to file for easy copy-paste
  const outputPath = path.join(__dirname, 'import-ready-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(validRows, null, 2));
  
  console.log('\n💾 Full data written to:', outputPath);
  console.log('\n🌐 Next steps:');
  console.log('   1. Open your Atomic Habits web app');
  console.log('   2. Go to the Import page');
  console.log('   3. Upload your CSV file there');
  console.log('   4. Click "Import Your Daily\'s CSV"');
  console.log('\n✨ The web app will handle authentication and import automatically!');
}

// Run the import
if (import.meta.url === `file://${process.argv[1]}`) {
  importCSV().catch(console.error);
}

export { importCSV, FIELD_MAPPING };