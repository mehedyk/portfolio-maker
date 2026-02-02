-- ============================================
-- Portfolio Builder Platform - Database Schema
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  credits INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment requests table
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  credits_requested INT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  proof_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES user_profiles(id)
);

-- Professions table
CREATE TABLE professions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sections JSONB
);

-- Themes table
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  colors JSONB NOT NULL,
  preview_image TEXT
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  profession_id INT REFERENCES professions(id),
  theme_id INT REFERENCES themes(id),
  username TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  content JSONB,
  images JSONB,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all user profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- Payment requests policies
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment requests" ON payment_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all payment requests
CREATE POLICY "Admins can view all payment requests" ON payment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update payment requests
CREATE POLICY "Admins can update payment requests" ON payment_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Portfolios policies
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view published portfolios
CREATE POLICY "Public can view published portfolios" ON portfolios
  FOR SELECT USING (is_published = true);

-- Professions and themes are public
CREATE POLICY "Anyone can view professions" ON professions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view themes" ON themes
  FOR SELECT USING (true);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function to publish portfolio and deduct credit
CREATE OR REPLACE FUNCTION publish_portfolio(
  portfolio_id UUID,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_credits INT;
BEGIN
  -- Get user credits
  SELECT credits INTO user_credits
  FROM user_profiles
  WHERE id = user_id;
  
  -- Check if user has enough credits
  IF user_credits < 1 THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credit
  UPDATE user_profiles
  SET credits = credits - 1
  WHERE id = user_id;
  
  -- Publish portfolio
  UPDATE portfolios
  SET is_published = true, published_at = NOW()
  WHERE id = portfolio_id AND user_id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve payment and add credits
CREATE OR REPLACE FUNCTION approve_payment(
  request_id UUID,
  admin_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  request_user_id UUID;
  credits_to_add INT;
BEGIN
  -- Get request details
  SELECT user_id, credits_requested 
  INTO request_user_id, credits_to_add
  FROM payment_requests
  WHERE id = request_id;
  
  -- Add credits to user
  UPDATE user_profiles
  SET credits = credits + credits_to_add
  WHERE id = request_user_id;
  
  -- Update payment request status
  UPDATE payment_requests
  SET status = 'approved',
      processed_at = NOW(),
      processed_by = admin_id
  WHERE id = request_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert professions
INSERT INTO professions (name, description, icon, sections) VALUES
('Developer', 'Software developers and programmers', '💻', '["about", "skills", "projects", "experience", "education", "github"]'),
('Designer', 'UI/UX and graphic designers', '🎨', '["about", "portfolio", "skills", "experience", "behance"]'),
('Doctor', 'Medical professionals', '⚕️', '["about", "specialization", "certifications", "publications", "experience"]'),
('Teacher', 'Educators and instructors', '📚', '["about", "philosophy", "subjects", "experience", "testimonials"]'),
('Freelancer', 'Independent professionals', '💼', '["about", "services", "rates", "portfolio", "testimonials", "contact"]');

-- Insert themes (2 free, 6 premium)
INSERT INTO themes (name, tier, colors) VALUES
('Light', 'free', '{"primary": "#3B82F6", "secondary": "#10B981", "background": "#FFFFFF", "text": "#1F2937"}'),
('Dark', 'free', '{"primary": "#60A5FA", "secondary": "#34D399", "background": "#111827", "text": "#F9FAFB"}'),
('Ocean Blue', 'premium', '{"primary": "#0EA5E9", "secondary": "#06B6D4", "background": "#F0F9FF", "text": "#0C4A6E"}'),
('Sunset Orange', 'premium', '{"primary": "#F97316", "secondary": "#FB923C", "background": "#FFF7ED", "text": "#7C2D12"}'),
('Forest Green', 'premium', '{"primary": "#10B981", "secondary": "#059669", "background": "#F0FDF4", "text": "#064E3B"}'),
('Midnight Purple', 'premium', '{"primary": "#8B5CF6", "secondary": "#A78BFA", "background": "#FAF5FF", "text": "#4C1D95"}'),
('Corporate Gray', 'premium', '{"primary": "#6B7280", "secondary": "#9CA3AF", "background": "#F9FAFB", "text": "#1F2937"}'),
('Minimalist Cream', 'premium', '{"primary": "#D97706", "secondary": "#FBBF24", "background": "#FFFBEB", "text": "#78350F"}');

-- ============================================
-- INDEXES (Optional but recommended)
-- ============================================

CREATE INDEX idx_portfolios_username ON portfolios(username);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_published ON portfolios(is_published);
CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
