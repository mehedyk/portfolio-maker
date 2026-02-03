-- ============================================
-- V2 Fix: "publish_portfolio_safe"
-- ============================================

-- We are creating a NEW function to bypass any Schema Cache issues with the old one.
-- We are using strictly prefixed parameters (p_) to avoid "ambiguous column" errors.

CREATE OR REPLACE FUNCTION publish_portfolio_safe(
  p_portfolio_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_credits INT;
BEGIN
  -- Get user credits
  SELECT credits INTO v_user_credits
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Check if user has enough credits
  IF v_user_credits < 1 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credit
  UPDATE user_profiles
  SET credits = credits - 1
  WHERE id = p_user_id;
  
  -- Publish portfolio
  -- Using p_ params here guarantees NO ambiguity with table columns
  UPDATE portfolios
  SET is_published = true, published_at = NOW()
  WHERE id = p_portfolio_id AND user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
