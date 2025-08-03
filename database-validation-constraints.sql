-- Data Validation Constraints for Atomic Habits Tracker
-- Run these commands in your Supabase SQL Editor to add robust data validation

-- 1. Add constraint for day_rating to match frontend options
ALTER TABLE public.daily_logs 
ADD CONSTRAINT day_rating_valid_values 
CHECK (day_rating IS NULL OR day_rating IN ('Terrible', 'Bad', 'Okay', 'Good', 'Legendary'));

-- 2. Add reasonable limits for text fields to prevent abuse
ALTER TABLE public.daily_logs 
ADD CONSTRAINT dream_length_limit 
CHECK (LENGTH(dream) <= 1000);

ALTER TABLE public.daily_logs 
ADD CONSTRAINT latest_hype_length_limit 
CHECK (LENGTH(latest_hype) <= 500);

-- 3. Add constraints for time fields to ensure valid times
ALTER TABLE public.daily_logs 
ADD CONSTRAINT time_awake_valid 
CHECK (time_awake IS NULL OR (time_awake >= '04:00' AND time_awake <= '12:00'));

ALTER TABLE public.daily_logs 
ADD CONSTRAINT bed_time_valid 
CHECK (bed_time IS NULL OR (bed_time >= '20:00' OR bed_time <= '03:00'));

-- 4. Add weight constraints for reasonable values
ALTER TABLE public.daily_logs 
ADD CONSTRAINT weight_reasonable 
CHECK (weight_lbs IS NULL OR (weight_lbs >= 50 AND weight_lbs <= 1000));

-- 5. Add calorie constraints for reasonable values  
ALTER TABLE public.daily_logs 
ADD CONSTRAINT calories_reasonable 
CHECK (calories IS NULL OR (calories >= 500 AND calories <= 10000));

-- 6. Add constraint for workout array to prevent empty strings
ALTER TABLE public.daily_logs 
ADD CONSTRAINT workout_valid_entries 
CHECK (workout IS NULL OR (
  array_length(workout, 1) IS NULL OR 
  array_length(workout, 1) <= 7 AND 
  NOT ('' = ANY(workout))
));

-- 7. Add constraint to ensure log_date is not in the future
ALTER TABLE public.daily_logs 
ADD CONSTRAINT log_date_not_future 
CHECK (log_date <= CURRENT_DATE);

-- 8. Add constraint to prevent logs older than 10 years (data quality)
ALTER TABLE public.daily_logs 
ADD CONSTRAINT log_date_not_too_old 
CHECK (log_date >= CURRENT_DATE - INTERVAL '10 years');

-- 9. Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_daily_logs_updated_at ON public.daily_logs;

CREATE TRIGGER update_daily_logs_updated_at 
BEFORE UPDATE ON public.daily_logs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Add comments for better documentation
COMMENT ON CONSTRAINT day_rating_valid_values ON public.daily_logs 
IS 'Ensures day_rating matches frontend dropdown options';

COMMENT ON CONSTRAINT dream_length_limit ON public.daily_logs 
IS 'Prevents excessively long dream entries (max 1000 chars)';

COMMENT ON CONSTRAINT latest_hype_length_limit ON public.daily_logs 
IS 'Prevents excessively long hype entries (max 500 chars)';

COMMENT ON CONSTRAINT log_date_not_future ON public.daily_logs 
IS 'Prevents logging future dates';

COMMENT ON CONSTRAINT log_date_not_too_old ON public.daily_logs 
IS 'Prevents logging dates older than 10 years';

-- Validation test queries (run these to verify constraints work):

-- Test 1: Valid day_rating (should succeed)
-- INSERT INTO daily_logs (user_id, log_date, day_rating) VALUES (auth.uid(), CURRENT_DATE, 'Good');

-- Test 2: Invalid day_rating (should fail)
-- INSERT INTO daily_logs (user_id, log_date, day_rating) VALUES (auth.uid(), CURRENT_DATE, 'Amazing');

-- Test 3: Future date (should fail)
-- INSERT INTO daily_logs (user_id, log_date) VALUES (auth.uid(), CURRENT_DATE + 1);

-- Test 4: Excessive text length (should fail)
-- INSERT INTO daily_logs (user_id, log_date, dream) VALUES (auth.uid(), CURRENT_DATE, repeat('x', 1001));