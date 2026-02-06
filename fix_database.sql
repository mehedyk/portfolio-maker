-- ============================================================================
-- DATABASE FIXES
-- Run this file in your Supabase SQL Editor to fix account creation issues.
-- ============================================================================

-- DANGER ZONE: We are dropping constraints to ensure clean state if they exist poorly
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

-- 1. Create a function to handle new user creation automatically
-- This is safer than letting the client insert into public.user_profiles directly
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, username, role, credits)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username',
    'user',
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Fix RLS Policies just in case (Ensures users can read their own profile freely)
DROP POLICY IF EXISTS "Users view own profile" ON public.user_profiles;
CREATE POLICY "Users view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- (Optional) If we wanted to allow manual inserts, we would add this:
-- CREATE POLICY "Users insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- But we are using the trigger method now, which is superior.

-- 4. Grant permissions to authenticated users to ensure they can view the table
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
