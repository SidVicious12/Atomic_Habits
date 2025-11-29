# Google Sheets Write Setup via Apps Script

This guide shows you how to set up a Google Apps Script webhook that allows your HabitLoop app to **append new rows** to your Google Sheet without requiring OAuth.

## Why Apps Script?

- **Simple**: No OAuth flow needed
- **Secure**: Only your webhook can write to your sheet
- **Append-only**: Perfect for your requirement to never overwrite existing rows
- **Free**: Uses your Google account quota

---

## Step 1: Create the Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Name it `HabitLoop Sheet Writer`
4. Delete any existing code and paste the following:

```javascript
/**
 * HabitLoop Google Sheets Writer
 * Handles append and upsert operations from your web app
 */

// Your Sheet ID (from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Sheet1'; // or whatever your sheet tab is named

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return createResponse({ error: 'Sheet not found' });
    }

    switch (data.action) {
      case 'append':
        return handleAppend(sheet, data);
      case 'upsert':
        return handleUpsert(sheet, data);
      case 'checkDate':
        return handleCheckDate(sheet, data);
      default:
        return createResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    return createResponse({ error: error.toString() });
  }
}

function handleAppend(sheet, data) {
  // Always append a new row at the end
  const lastRow = sheet.getLastRow();
  const newRow = lastRow + 1;
  
  // Write the data
  sheet.getRange(newRow, 1, 1, data.data.length).setValues([data.data]);
  
  return createResponse({ 
    success: true, 
    action: 'inserted',
    rowNumber: newRow,
    message: `Row ${newRow} appended successfully`
  });
}

function handleUpsert(sheet, data) {
  // Find existing row with this date
  const dateCol = 1; // Assuming date is in column A
  const lastRow = sheet.getLastRow();
  const dates = sheet.getRange(2, dateCol, lastRow - 1, 1).getValues();
  
  let existingRow = -1;
  for (let i = 0; i < dates.length; i++) {
    const cellDate = formatDateForComparison(dates[i][0]);
    if (cellDate === data.date) {
      existingRow = i + 2; // +2 because array is 0-indexed and we start from row 2
      break;
    }
  }
  
  if (existingRow > 0) {
    // Update existing row
    sheet.getRange(existingRow, 1, 1, data.data.length).setValues([data.data]);
    return createResponse({ 
      success: true, 
      action: 'updated',
      rowNumber: existingRow,
      message: `Row ${existingRow} updated for date ${data.date}`
    });
  } else {
    // Append new row
    return handleAppend(sheet, data);
  }
}

function handleCheckDate(sheet, data) {
  const dateCol = 1;
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    return createResponse({ exists: false });
  }
  
  const dates = sheet.getRange(2, dateCol, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < dates.length; i++) {
    const cellDate = formatDateForComparison(dates[i][0]);
    if (cellDate === data.date) {
      return createResponse({ 
        exists: true, 
        rowNumber: i + 2 
      });
    }
  }
  
  return createResponse({ exists: false });
}

function formatDateForComparison(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  
  // Handle Date objects
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function - run this to verify your sheet connection
function testConnection() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  Logger.log('Sheet name: ' + sheet.getName());
  Logger.log('Last row: ' + sheet.getLastRow());
  Logger.log('Connection successful!');
}
```

---

## Step 2: Configure the Script

1. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
   - Find it in your sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit`
   - Your Sheet ID is: `1Nlpar2t_3leYPqDsFz4IordiFE4-RBVUHHLT8ySJ3Y0` (from your config)

2. Update `SHEET_NAME` if your tab is not named "Sheet1"

3. Run the `testConnection` function to verify it works:
   - Click the function dropdown and select `testConnection`
   - Click Run
   - Check the Execution Log for success message

---

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon and select **Web app**
3. Configure:
   - **Description**: HabitLoop Writer v1
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** the script when prompted (click through the "unsafe" warning - it's your own script)
6. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

---

## Step 4: Add URL to Your App

Add this line to your `.env` file:

```env
VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## Step 5: Test It

After restarting your dev server, the Quick Daily Entry form should now be able to save directly to your Google Sheet!

---

## Column Mapping

The script expects your columns in this order (adjust `formatRowForSheet` in `google-sheets-write.ts` if different):

| Col | Field |
|-----|-------|
| A | Date |
| B | Day |
| C | Time Awake |
| D | Coffee |
| E | Breakfast |
| F | Time at Work |
| G | Time Left Work |
| H | Netflix in Bed? |
| I | Phone 30min after wake? |
| J | # of Dabs |
| K | # of Water Bottles |
| L | # of Pages Read |
| M | Brush Teeth at Night |
| N | Wash Face at Night |
| O | Green Tea |
| P | Drink (alcohol) |
| Q | Smoke |
| R | Soda |
| S | Chocolate |
| T | Workout |
| U | Relax? |
| V | How was my day? |
| W | Weight in lbs |
| X | Calories |
| Y | Latest hype? |
| Z | Dream I had |
| AA | Bed time |
| AB | Morning walk |

---

## Troubleshooting

**Error: "Sheet not found"**
- Check your SHEET_ID and SHEET_NAME are correct

**Error: "Authorization required"**
- Re-run the deployment and authorize again

**Error: "CORS"**
- Make sure you deployed as "Anyone can access"

**Changes not appearing?**
- Create a new deployment version after code changes

---

## Security Notes

- The webhook URL is essentially a password - don't share it publicly
- Consider adding a secret token check in production
- The "Anyone can access" setting is for the endpoint, but only your app knows the URL
