# HabitLoop Deployment Guide - Hostinger

## Quick Deployment Steps

### Option 1: File Manager Upload (Easiest)

1. **Login to Hostinger**
   - Go to your Hostinger control panel
   - Navigate to **File Manager**

2. **Navigate to public_html**
   - Click on `public_html` folder
   - Delete any existing files (like the default Hostinger page)

3. **Upload Your Built Files**
   - Go to your local `Atomic_Habits/dist` folder
   - Select ALL files and folders inside `dist/`:
     - `index.html`
     - `css/` folder
     - `js/` folder
     - `images/` folder
     - `favicon.svg`
     - Any other files
   - Upload them to `public_html`

4. **Important: Set Environment Variables**
   - In Hostinger, go to **Advanced** → **Environment Variables** (if available)
   - OR create a `.env` file in `public_html` with:
     ```env
     VITE_SUPABASE_URL=https://zbirexayznabkvainiei.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXJleGF5em5hYmt2YWluaWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDI0NDYsImV4cCI6MjA2ODIxODQ0Nn0.DDh0NRqHeYgvchLvAtsFGcuPKNnXFYnXDUDioYQDZzY
     VITE_GOOGLE_SHEET_ID=1Nlpar2t_3leYPqDsFz4IordiFE4-RBVUHHLT8ySJ3Y0
     VITE_GOOGLE_SHEET_NAME=HabitLoop
     VITE_GOOGLE_API_KEY=AIzaSyBEK2GJwV2wq7gite6a_kMCU4WlNwtyrjk
     VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-automation@atomic-habits-479700.iam.gserviceaccount.com
     VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycby7DhYWYZs5jiQ0-tSwNkM0Twx153ilrK4dAZyvKt3-M4BMYyocaJvZTw0Gdbmtt8UZ/exec
     ```

5. **Configure Routing (Important for React)**
   - Create a `.htaccess` file in `public_html` with:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

6. **Visit Your Site**
   - Go to `https://habitloop.net`
   - Your app should now be live! 🎉

---

### Option 2: FTP Upload (Alternative)

1. **Get FTP Credentials**
   - In Hostinger, go to **File Manager** → **FTP Accounts**
   - Note your FTP hostname, username, and password

2. **Use an FTP Client**
   - Download FileZilla (https://filezilla-project.org/)
   - Connect using your credentials
   - Navigate to `public_html`
   - Upload all files from your local `dist/` folder

3. **Follow steps 4-6 from Option 1**

---

### Option 3: Git Deployment (Advanced)

If Hostinger supports Git deployment:

1. **Enable Git in Hostinger**
   - Go to Advanced → Git
   - Connect your GitHub repository

2. **Set Build Command**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Add Environment Variables**
   - In Hostinger settings, add all the VITE_ variables

---

## Important Notes

### ⚠️ Environment Variables
**CRITICAL**: Vite environment variables are compiled into the JavaScript at build time. Since you already built the app locally, the environment variables from your local `.env` are already in the built files.

**This means your current deployment should work as-is!** The environment variables are already embedded in the JavaScript files.

### Verify Deployment Checklist

After uploading, check:
- ✅ `https://habitloop.net` shows your app (not Hostinger landing page)
- ✅ Login page appears at `https://habitloop.net/login`
- ✅ You can log in with your Supabase credentials
- ✅ Dashboard shows your habit data from Google Sheets
- ✅ "Log Habits" button works and saves to Google Sheets

### Troubleshooting

**Issue: 404 errors when navigating**
- Solution: Add the `.htaccess` file (see step 5 above)

**Issue: Blank page**
- Check browser console (F12) for errors
- Verify all files were uploaded correctly
- Check that `index.html` is in the root of `public_html`

**Issue: "Google Sheets write not configured"**
- This might appear because environment variables weren't compiled
- Rebuild locally with: `npm run build`
- Re-upload the `dist/` folder

**Issue: Login not working**
- Check browser console for Supabase errors
- Verify your Supabase project settings allow `habitloop.net` as a redirect URL

---

## Quick Upload via Terminal (macOS/Linux)

If you have FTP access, you can use this script:

```bash
# Install lftp if not already installed
# brew install lftp (macOS)

# Upload files
lftp -u YOUR_FTP_USERNAME,YOUR_FTP_PASSWORD ftp.yourhostname.com << EOF
cd public_html
mirror -R dist/ ./
bye
EOF
```

Replace `YOUR_FTP_USERNAME`, `YOUR_FTP_PASSWORD`, and `ftp.yourhostname.com` with your actual credentials.

---

## Next Steps After Deployment

1. **Test Everything**
   - Try logging in
   - Log some habits
   - Verify data saves to Google Sheets

2. **Set Up SSL** (if not already enabled)
   - Hostinger usually provides free SSL
   - Enable it in your control panel

3. **Monitor Performance**
   - Check Google Sheets API quota
   - Monitor Supabase usage

4. **Update Supabase Settings**
   - Add `https://habitloop.net` to allowed redirect URLs in Supabase dashboard
   - Go to Authentication → URL Configuration

---

## File Structure After Upload

Your `public_html` should look like:

```
public_html/
├── index.html
├── favicon.svg
├── .htaccess (create this)
├── css/
│   └── index-a0b6f617.css
├── js/
│   ├── index-ef475f6a.js
│   ├── chunk-*.js (multiple files)
│   └── ...
└── images/
    └── logo-40f647c4.png
```

---

## Support

If you encounter issues:
1. Check the browser console (F12 → Console)
2. Check Hostinger error logs
3. Verify all files uploaded successfully
4. Make sure `.htaccess` is present for routing
