-- ============================================
-- Fix for Ambiguous Column Reference in publish_portfolio
-- ============================================

-- The previous version of publish_portfolio had parameters named matching table columns (user_id),
-- causing "column reference is ambiguous" errors.
-- We rename the parameters to p_portfolio_id and p_user_id to resolve this.

CREATE OR REPLACE FUNCTION publish_portfolio(
  portfolio_id UUID,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_credits INT;
  -- Assign parameters to local variables to prevent ANY ambiguity
  v_uid UUID := user_id;
  v_pid UUID := portfolio_id;
BEGIN
  -- Get user credits
  SELECT credits INTO v_user_credits
  FROM user_profiles
  WHERE id = v_uid;
  
  -- Check if user has enough credits
  IF v_user_credits < 1 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credit
  UPDATE user_profiles
  SET credits = credits - 1
  WHERE id = v_uid;
  
  -- Publish portfolio
  UPDATE portfolios
  SET is_published = true, published_at = NOW()
  WHERE id = v_pid AND user_id = v_uid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
