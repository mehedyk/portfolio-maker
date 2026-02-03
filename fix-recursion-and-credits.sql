-- ============================================
-- FIX: Infinite Recursion & Admin Access
-- ============================================

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all user profiles" ON user_profiles;

-- 2. Create a specific function to check admin status
-- SECURITY DEFINER allows this function to bypass RLS when checking the role
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the new policy using the secure function
CREATE POLICY "Admins can view all user profiles" ON user_profiles
  FOR SELECT USING (
    is_admin()
  );

-- 4. Fix credits (restore to 1 if they are 0 and no published portfolio)
UPDATE user_profiles up
SET credits = 1
WHERE credits = 0 OR credits IS NULL
AND NOT EXISTS (
    SELECT 1 FROM portfolios p 
    WHERE p.user_id = up.id AND p.is_published = true
);

-- 5. Verification
SELECT 
    email,
    role,
    credits,
    is_admin() as is_admin_check
FROM user_profiles;
