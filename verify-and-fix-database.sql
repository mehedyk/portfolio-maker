-- ============================================
-- Verification and Fix Script
-- ============================================
-- Run this in Supabase SQL Editor to check and fix issues
-- ============================================

-- 1. Check current user profiles (verify roles and credits)
SELECT 
    id,
    email,
    full_name,
    username,
    role,
    credits,
    created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 2. Fix credits for users who should have 1 credit but have 0
-- (Only for users who haven't published a portfolio)
UPDATE user_profiles up
SET credits = 1
WHERE credits = 0
AND NOT EXISTS (
    SELECT 1 FROM portfolios p 
    WHERE p.user_id = up.id AND p.is_published = true
);

-- 3. Verify the fix
SELECT 
    email,
    role,
    credits,
    (SELECT COUNT(*) FROM portfolios WHERE user_id = user_profiles.id AND is_published = true) as published_portfolios
FROM user_profiles
ORDER BY created_at DESC;

-- ============================================
-- If you still can't see the admin panel after running this:
-- 1. Make sure your role is 'admin' in the results above
-- 2. Sign out from the application
-- 3. Clear browser cache (or use incognito mode)
-- 4. Sign back in
-- ============================================
