-- REPLACE 'your-email@example.com' WITH YOUR ACTUAL SIGNUP EMAIL
-- Run this in Supabase SQL Editor

INSERT INTO public.user_profiles (id, email, full_name, username, role, credits)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'), 
  COALESCE(raw_user_meta_data->>'username', 'admin'), 
  'admin', 
  1
FROM auth.users
WHERE email = 'your-email@example.com' -- <--- PUT YOUR EMAIL HERE
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  credits = GREATEST(user_profiles.credits, 1)
RETURNING email, role, credits; -- <--- This will show you if it worked!
