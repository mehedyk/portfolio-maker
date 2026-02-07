-- FIX FOR 500 INTERNAL SERVER ERROR (Infinite Recursion in RLS)

-- 1. Create a secure function to check admin status without triggering RLS loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- We use a direct query inside a SECURITY DEFINER function to bypass RLS
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins view all requests" ON payment_requests;
DROP POLICY IF EXISTS "Admins update requests" ON payment_requests;

-- 3. Re-create policies using the safe function
CREATE POLICY "Admins view all profiles" ON user_profiles FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Admins view all requests" ON payment_requests FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Admins update requests" ON payment_requests FOR UPDATE 
    USING (public.is_admin());

-- 4. Ensure basic user policies are still correct (Just in case)
DROP POLICY IF EXISTS "Users view own profile" ON user_profiles;
CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);

-- 5. Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;
