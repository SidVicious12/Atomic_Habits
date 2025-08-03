-- Database Performance Indexes for Atomic Habits Tracker
-- Run these commands in your Supabase SQL Editor to improve query performance

-- 1. Primary index for user-based queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id 
ON public.daily_logs(user_id);

-- 2. Index for date-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date 
ON public.daily_logs(log_date DESC);

-- 3. Composite index for user + date queries (most efficient for this app)
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date 
ON public.daily_logs(user_id, log_date DESC);

-- 4. Index for audit queries and recent data fetching
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_created 
ON public.daily_logs(user_id, created_at DESC);

-- 5. Partial index for recent logs (last 90 days) - most accessed data
CREATE INDEX IF NOT EXISTS idx_daily_logs_recent 
ON public.daily_logs(user_id, log_date DESC) 
WHERE log_date >= CURRENT_DATE - INTERVAL '90 days';

-- Performance validation queries - run these to test index effectiveness:

-- Query 1: Get latest log for user (should use idx_daily_logs_user_date)
-- EXPLAIN ANALYZE SELECT * FROM daily_logs WHERE user_id = 'your-user-id' ORDER BY log_date DESC LIMIT 1;

-- Query 2: Get logs for date range (should use idx_daily_logs_user_date)
-- EXPLAIN ANALYZE SELECT * FROM daily_logs WHERE user_id = 'your-user-id' AND log_date BETWEEN '2024-01-01' AND '2024-01-31';

-- Query 3: Count total logs for user (should use idx_daily_logs_user_id)
-- EXPLAIN ANALYZE SELECT COUNT(*) FROM daily_logs WHERE user_id = 'your-user-id';

-- Expected performance improvements:
-- - User queries: 10-50x faster (depending on data size)
-- - Date range queries: 5-20x faster
-- - Recent data queries: 2-10x faster
-- - Overall response time: <100ms for typical queries