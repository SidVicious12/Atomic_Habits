/**
 * HabitLoop Enhanced Google Sheets Handler
 * 
 * Features:
 * - Append new rows
 * - Upsert (update or insert)
 * - Get data for date range (historical viewing)
 * - Update existing rows by date
 * - Check if date exists
 * 
 * SETUP:
 * 1. Replace SHEET_ID with your actual sheet ID
 * 2. Replace SHEET_NAME with your sheet tab name
 * 3. Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * 4. Copy the deployment URL to your .env as VITE_GOOGLE_SHEETS_WEBHOOK_URL
 */

// ========== CONFIGURATION ==========
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your sheet ID
const SHEET_NAME = 'HABIT dashboard'; // Replace with your sheet tab name
const DATE_COLUMN = 2; // Column B contains the date (1-indexed)
// ====================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found: ' + SHEET_NAME });
    }

    switch (data.action) {
      case 'append':
        return handleAppend(sheet, data);
      case 'upsert':
        return handleUpsert(sheet, data);
      case 'checkDate':
        return handleCheckDate(sheet, data);
      case 'getDateRange':
        return handleGetDateRange(sheet, data);
      case 'getRowByDate':
        return handleGetRowByDate(sheet, data);
      case 'updateRow':
        return handleUpdateRow(sheet, data);
      default:
        return createResponse({ error: 'Unknown action: ' + data.action });
    }
  } catch (error) {
    return createResponse({ error: error.toString() });
  }
}

// Also support GET requests for simple data fetching
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' });
    }

    const action = e.parameter.action;
    
    if (action === 'getDateRange') {
      return handleGetDateRange(sheet, {
        startDate: e.parameter.startDate,
        endDate: e.parameter.endDate
      });
    }
    
    if (action === 'getRowByDate') {
      return handleGetRowByDate(sheet, { date: e.parameter.date });
    }
    
    return createResponse({ error: 'Unknown action or missing parameters' });
  } catch (error) {
    return createResponse({ error: error.toString() });
  }
}

/**
 * Append a new row at the end
 */
function handleAppend(sheet, data) {
  const lastRow = sheet.getLastRow();
  const newRow = lastRow + 1;
  
  sheet.getRange(newRow, 1, 1, data.data.length).setValues([data.data]);
  
  return createResponse({ 
    success: true, 
    action: 'inserted',
    rowNumber: newRow,
    message: 'Row ' + newRow + ' appended successfully'
  });
}

/**
 * Upsert: Update if date exists, append if not
 */
function handleUpsert(sheet, data) {
  const existingRow = findRowByDate(sheet, data.date);
  
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, data.data.length).setValues([data.data]);
    return createResponse({ 
      success: true, 
      action: 'updated',
      rowNumber: existingRow,
      message: 'Row ' + existingRow + ' updated for date ' + data.date
    });
  } else {
    return handleAppend(sheet, data);
  }
}

/**
 * Check if a date exists in the sheet
 */
function handleCheckDate(sheet, data) {
  const rowNumber = findRowByDate(sheet, data.date);
  return createResponse({ 
    exists: rowNumber > 0, 
    rowNumber: rowNumber > 0 ? rowNumber : null 
  });
}

/**
 * Get all rows within a date range (for historical viewing)
 */
function handleGetDateRange(sheet, data) {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return createResponse({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return createResponse({ success: true, rows: [], headers: [] });
  }
  
  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Get all data
  const allData = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Filter by date range
  const filteredRows = [];
  for (let i = 0; i < allData.length; i++) {
    const rowDate = formatDateForComparison(allData[i][DATE_COLUMN - 1]);
    if (rowDate) {
      const d = new Date(rowDate);
      if (d >= startDate && d <= endDate) {
        filteredRows.push({
          rowNumber: i + 2, // +2 because 0-indexed and header row
          date: rowDate,
          data: allData[i]
        });
      }
    }
  }
  
  // Sort by date descending (most recent first)
  filteredRows.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return createResponse({ 
    success: true, 
    rows: filteredRows,
    headers: headers,
    count: filteredRows.length
  });
}

/**
 * Get a specific row by date
 */
function handleGetRowByDate(sheet, data) {
  const rowNumber = findRowByDate(sheet, data.date);
  
  if (rowNumber < 1) {
    return createResponse({ 
      success: true, 
      exists: false, 
      row: null 
    });
  }
  
  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Get the row data
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  return createResponse({ 
    success: true, 
    exists: true,
    rowNumber: rowNumber,
    headers: headers,
    data: rowData
  });
}

/**
 * Update an existing row by date (with validation)
 */
function handleUpdateRow(sheet, data) {
  const rowNumber = findRowByDate(sheet, data.date);
  
  if (rowNumber < 1) {
    return createResponse({ 
      success: false, 
      error: 'No row found for date: ' + data.date 
    });
  }
  
  // Update the row
  sheet.getRange(rowNumber, 1, 1, data.data.length).setValues([data.data]);
  
  return createResponse({ 
    success: true, 
    action: 'updated',
    rowNumber: rowNumber,
    message: 'Row ' + rowNumber + ' updated successfully'
  });
}

/**
 * Find row number by date
 * Returns row number (1-indexed) or -1 if not found
 */
function findRowByDate(sheet, targetDate) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  
  const dates = sheet.getRange(2, DATE_COLUMN, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < dates.length; i++) {
    const cellDate = formatDateForComparison(dates[i][0]);
    if (cellDate === targetDate) {
      return i + 2; // +2 because 0-indexed and we start from row 2
    }
  }
  
  return -1;
}

/**
 * Format date for comparison (YYYY-MM-DD)
 */
function formatDateForComparison(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse it
    date = new Date(date);
  }
  
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }
  
  return '';
}

/**
 * Create JSON response
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this to verify your sheet connection
 */
function testConnection() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Last row: ' + sheet.getLastRow());
  Logger.log('Last column: ' + sheet.getLastColumn());
  
  // Test date finding
  const today = new Date();
  const dateStr = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  const row = findRowByDate(sheet, dateStr);
  Logger.log('Row for today (' + dateStr + '): ' + row);
  
  Logger.log('Connection successful!');
}

/**
 * Test getting date range
 */
function testGetDateRange() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const result = handleGetDateRange(sheet, {
    startDate: weekAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  });
  
  Logger.log(result.getContent());
}
