# HabitLoop - Google Sheets Setup Guide

## ✅ Migration Complete!

Your app has been successfully migrated from Supabase to Google Sheets as the single source of truth.

## What Changed

### ✅ Completed
- **Data Source**: Now reads from Google Sheets instead of Supabase
- **Authentication**: Removed (app is now public, no login required)
- **Write Operations**: Disabled in the app (update Google Sheets directly)
- **Environment**: Cleaned up `.env` to remove Supabase credentials

### 📊 How It Works Now
- All dashboard data is pulled from your Google Sheet in real-time
- Data refreshes every 5 minutes automatically
- To add new habit logs, update your Google Sheet directly
- The app displays your data beautifully with charts and analytics

## Setup Instructions

### 1. Make Your Google Sheet Public
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Nlpar2t_3leYPqDsFz4IordiFE4-RBVUHHLT8ySJ3Y0
2. Click **Share** button (top right)
3. Click **Change to anyone with the link**
4. Set to **Viewer** access
5. Copy the link

### 2. Get a Google API Key (Optional but Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project: `atomic-habits-479700`
3. Click **Create Credentials** → **API Key**
4. Copy the API key
5. Add it to `.env`:
   ```
   VITE_GOOGLE_API_KEY=your-api-key-here
   ```
6. **Enable Google Sheets API**:
   - Go to [API Library](https://console.cloud.google.com/apis/library)
   - Search for "Google Sheets API"
   - Click **Enable**

### 3. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Google Sheet Format

Your sheet should have these columns (first row as headers):

| log_date | morning_walk | coffee | breakfast | water_bottles_count | ... |
|----------|--------------|--------|-----------|---------------------|-----|
| 2024-01-15 | TRUE | TRUE | FALSE | 4 | ... |

### Column Names
- `log_date` - Date in YYYY-MM-DD format
- Boolean fields: `TRUE`/`FALSE` or `1`/`0` or `yes`/`no`
- Numeric fields: Just the number (e.g., `4`, `150.5`)

## Features Still Working
✅ Dashboard with all metrics
✅ Category pages with charts
✅ Habit detail pages
✅ Date range filtering
✅ Real-time data updates
✅ Beautiful 3D visualizations

## Features Disabled
❌ Login/Signup (no longer needed)
❌ Adding new logs via the app (use Google Sheets)
❌ Editing logs via the app (use Google Sheets)

## To Add New Habit Logs
1. Open your Google Sheet
2. Add a new row with today's date
3. Fill in your habits (TRUE/FALSE for checkboxes, numbers for counts)
4. Save
5. Refresh the app (or wait 5 minutes for auto-refresh)

## Troubleshooting

### "No data found"
- Check that your Google Sheet is publicly accessible
- Verify the sheet ID in `.env` matches your sheet
- Make sure the first row contains column headers

### "Failed to fetch from Google Sheets"
- Add a Google API key to `.env`
- Enable Google Sheets API in your Google Cloud project
- Check that the API key has no restrictions blocking Sheets API

### Data not updating
- Data is cached for 5 minutes
- Click the refresh button in the app
- Or clear browser cache and reload

## Next Steps

1. **Add your Google API key** to `.env` (recommended for better performance)
2. **Test the app** - it should load data from your Google Sheet
3. **Update your Google Sheet** to add new habit logs
4. **Deploy to habitloop.net** when ready!

## Need Help?
- Check the browser console for errors
- Verify your Google Sheet is accessible
- Make sure the sheet format matches the expected columns
