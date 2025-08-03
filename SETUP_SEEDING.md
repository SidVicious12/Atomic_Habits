# Database Seeding Setup Guide

## Prerequisites

Before running the seed script, you need to set up your environment variables and create a test user.

## Step 1: Environment Variables

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_TEST_USER_EMAIL=your-test-email@example.com
   VITE_TEST_USER_PASSWORD=your-test-password
   ```

   **Where to find these values:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy the **Project URL** and **anon/public key**

## Step 2: Create Test User

You have two options:

### Option A: Through the App
1. Start your development server: `npm run dev`
2. Navigate to the signup page
3. Create a new user account
4. Use those credentials in your `.env` file

### Option B: Through Supabase Dashboard
1. Go to Authentication → Users in your Supabase dashboard
2. Click "Invite a user"
3. Enter an email and temporary password
4. Use those credentials in your `.env` file

## Step 3: Run Database Setup

1. **Apply database indexes (for performance):**
   - Open your Supabase SQL Editor
   - Copy and paste the contents of `database-performance-indexes.sql`
   - Click "Run"

2. **Apply data validation constraints:**
   - In the same SQL Editor
   - Copy and paste the contents of `database-validation-constraints.sql`
   - Click "Run"

## Step 4: Run Seed Script

```bash
node scripts/seed.mjs
```

**Expected Output:**
```
Attempting to authenticate as test@example.com...
Authenticated as user: 12345678-1234-1234-1234-123456789012. Starting to seed data...
Deleting existing logs for the user to prevent duplicates...
Inserting 30 new log entries...
Successfully seeded 30 days of daily logs!
```

## Troubleshooting

### Error: "Supabase URL or Anon Key is missing"
- Check that your `.env` file exists and has the correct variable names
- Ensure there are no extra spaces around the values
- Verify your Supabase credentials are correct

### Error: "Failed to authenticate test user"
- Verify the test user exists in your Supabase Auth dashboard
- Check that the email/password in `.env` are correct
- Make sure the user account is confirmed (check email)

### Error: Database constraint violations
- Run the SQL files from Step 3 first
- Check that your database schema matches the one in `create_daily_logs_table.sql`

### Error: Permission denied
- Verify Row Level Security policies are set up correctly
- Check that the test user can access the `daily_logs` table

## Verify Success

After seeding, you can verify the data was inserted:

1. **Using the debug script:**
   ```bash
   node debug-tables.mjs
   ```

2. **Using Supabase dashboard:**
   - Go to Table Editor → daily_logs
   - You should see 30 entries for your test user

3. **Using the app:**
   - Log in with your test user credentials
   - Navigate to the dashboard
   - You should see charts populated with the seeded data