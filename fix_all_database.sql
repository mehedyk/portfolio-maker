-- ============================================================================
-- PORTFOLIO BUILDER - COMPREHENSIVE DATABASE FIX
-- Run this in Supabase SQL Editor to fix all known DB issues.
-- Safe to run on existing data — uses CREATE OR REPLACE / IF NOT EXISTS.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 1: RLS Recursion Bug
-- Creates a SECURITY DEFINER function to break the infinite RLS loop
-- on user_profiles when admin checks trigger policy re-evaluation.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
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

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- Drop and recreate the recursive policies using the safe function
DROP POLICY IF EXISTS "Admins view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins view all requests" ON payment_requests;
DROP POLICY IF EXISTS "Admins update requests" ON payment_requests;
DROP POLICY IF EXISTS "Admins insert requests" ON payment_requests;

CREATE POLICY "Admins view all profiles" ON user_profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins view all requests" ON payment_requests FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins update requests" ON payment_requests FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins insert requests" ON payment_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Ensure basic user policies exist
DROP POLICY IF EXISTS "Users view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;

CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE
    USING (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 2: Add missing cv_url column to portfolios table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS cv_url TEXT DEFAULT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 3: Create missing increment_portfolio_views RPC
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.increment_portfolio_views(portfolio_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE portfolios
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = portfolio_id
      AND is_published = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_portfolio_views TO anon;
GRANT EXECUTE ON FUNCTION public.increment_portfolio_views TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 4: Ensure publish_portfolio_safe RPC exists and is correct
-- Atomically: saves portfolio as published + deducts 1 credit
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop first to allow changing return type if it existed with a different signature
DROP FUNCTION IF EXISTS public.publish_portfolio_safe(uuid, uuid);

CREATE OR REPLACE FUNCTION public.publish_portfolio_safe(
    p_portfolio_id UUID,
    p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_credits INTEGER;
BEGIN
    -- Check credits with row lock to prevent race conditions
    SELECT credits INTO v_credits
    FROM user_profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_credits IS NULL OR v_credits < 1 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    -- Deduct credit
    UPDATE user_profiles
    SET credits = credits - 1
    WHERE id = p_user_id;

    -- Publish portfolio
    UPDATE portfolios
    SET is_published = TRUE,
        updated_at = NOW()
    WHERE id = p_portfolio_id
      AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.publish_portfolio_safe TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 5: Ensure handle_new_user trigger exists
-- Creates user_profiles row on signup
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, username, credits, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)),
        1,
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 6: Enable RLS on all tables (safety check)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 7: Portfolio RLS policies
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public portfolios are viewable by everyone" ON portfolios;
DROP POLICY IF EXISTS "Users can manage own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolios" ON portfolios;

CREATE POLICY "Public portfolios are viewable by everyone" ON portfolios
    FOR SELECT USING (is_published = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can insert own portfolios" ON portfolios
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own portfolios" ON portfolios
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own portfolios" ON portfolios
    FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 8: Ensure updated_at triggers exist
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ─────────────────────────────────────────────────────────────────────────────
-- Done! Summary of fixes applied:
--   1. ✅ RLS infinite recursion fixed via is_admin() SECURITY DEFINER function
--   2. ✅ cv_url column added to portfolios table
--   3. ✅ increment_portfolio_views RPC created
--   4. ✅ publish_portfolio_safe RPC created with atomic credit deduction
--   5. ✅ handle_new_user trigger ensured
--   6. ✅ RLS enabled on all tables
--   7. ✅ Portfolio RLS policies corrected
--   8. ✅ updated_at triggers ensured
-- ─────────────────────────────────────────────────────────────────────────────