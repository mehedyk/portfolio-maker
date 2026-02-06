-- ============================================================================
-- PORTFOLIO BUILDER - COMPLETE DATABASE SCHEMA
-- Run this ENTIRE file in Supabase SQL Editor to reset/setup the database.
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEAN UP (Drop everything to start fresh)
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS publish_portfolio_safe CASCADE;
DROP FUNCTION IF EXISTS approve_payment CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop tables
DROP TABLE IF EXISTS payment_requests CASCADE;
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS themes CASCADE;
DROP TABLE IF EXISTS professions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- USER PROFILES
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 1,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFESSIONS (Hierarchical)
CREATE TABLE professions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '💼',
    parent_id INTEGER REFERENCES professions(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 4),
    requires_specialty BOOLEAN DEFAULT FALSE,
    requires_booking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- THEMES
CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    colors JSONB DEFAULT '{"primary": "#0ea5e9", "secondary": "#06b6d4"}',
    template_component TEXT DEFAULT 'MehedyLight',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORTFOLIOS
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profession_id INTEGER REFERENCES professions(id),
    theme_id INTEGER REFERENCES themes(id),
    username TEXT UNIQUE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    content JSONB DEFAULT '{}',
    images JSONB DEFAULT '{"profile": ""}',
    specialty_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENT REQUESTS
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    credits_requested INTEGER NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT,
    proof_image TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_professions_parent_id ON professions(parent_id);
CREATE INDEX idx_professions_level ON professions(level);
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_username ON portfolios(username);
CREATE INDEX idx_portfolios_is_published ON portfolios(is_published);
CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);

-- ============================================================================
-- STEP 4: INSERT SEED DATA
-- ============================================================================

-- PROFESSIONS
INSERT INTO professions (name, slug, icon, parent_id, level, requires_specialty, requires_booking) VALUES
-- Level 1
('Engineer', 'engineer', '⚙️', NULL, 1, FALSE, FALSE),
('Doctor', 'doctor', '⚕️', NULL, 1, TRUE, TRUE),
('Teacher', 'teacher', '👨‍🏫', NULL, 1, TRUE, FALSE),
('Others', 'others', '💼', NULL, 1, FALSE, FALSE),
-- Level 2: Engineer children
('Software Engineer', 'software-engineer', '💻', 1, 2, FALSE, FALSE),
('Computer Engineer', 'computer-engineer', '🖥️', 1, 2, FALSE, FALSE),
('Civil Engineer', 'civil-engineer', '🏗️', 1, 2, FALSE, FALSE),
('Electrical Engineer', 'electrical-engineer', '⚡', 1, 2, FALSE, FALSE),
-- Level 3: Software Engineer children
('Developer', 'developer', '👨‍💻', 5, 3, FALSE, FALSE),
('Cyber Security', 'cyber-security', '🔒', 5, 3, FALSE, FALSE),
('Data Science', 'data-science', '📊', 5, 3, FALSE, FALSE),
-- Level 4: Developer children
('Frontend Developer', 'frontend-developer', '🎨', 9, 4, FALSE, FALSE),
('Backend Developer', 'backend-developer', '🔧', 9, 4, FALSE, FALSE),
('Full Stack Developer', 'full-stack-developer', '🚀', 9, 4, FALSE, FALSE);

-- THEMES
INSERT INTO themes (name, slug, tier, colors, template_component) VALUES
('Professional Blue', 'professional-blue', 'free', '{"primary": "#2563eb", "secondary": "#3b82f6"}', 'MehedyLight'),
('Minimal Dark', 'minimal-dark', 'free', '{"primary": "#6366f1", "secondary": "#818cf8"}', 'MehedyDark'),
('Ocean Breeze', 'ocean-breeze', 'premium', '{"primary": "#06b6d4", "secondary": "#22d3ee"}', 'DefaultTemplate'),
('Sunset Glow', 'sunset-glow', 'premium', '{"primary": "#f97316", "secondary": "#fb923c"}', 'DefaultTemplate'),
('Purple Reign', 'purple-reign', 'premium', '{"primary": "#a855f7", "secondary": "#c084fc"}', 'DefaultTemplate'),
('Rose Pink', 'rose-pink', 'premium', '{"primary": "#ec4899", "secondary": "#f472b6"}', 'DefaultTemplate'),
('Emerald Green', 'emerald-green', 'premium', '{"primary": "#059669", "secondary": "#10b981"}', 'DefaultTemplate'),
('Crimson Red', 'crimson-red', 'premium', '{"primary": "#dc2626", "secondary": "#ef4444"}', 'DefaultTemplate');

-- ============================================================================
-- STEP 5: CREATE FUNCTIONS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle New User (Auto-Profile Creation)
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

-- Publish portfolio function
CREATE OR REPLACE FUNCTION publish_portfolio_safe(
    p_portfolio_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_credits INTEGER;
    v_is_published BOOLEAN;
BEGIN
    SELECT credits INTO v_current_credits
    FROM user_profiles WHERE id = p_user_id;
    
    SELECT is_published INTO v_is_published
    FROM portfolios WHERE id = p_portfolio_id AND user_id = p_user_id;
    
    IF v_is_published = TRUE THEN
        UPDATE portfolios SET updated_at = NOW()
        WHERE id = p_portfolio_id AND user_id = p_user_id;
        RETURN TRUE;
    END IF;
    
    IF v_current_credits < 1 THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    UPDATE user_profiles SET credits = credits - 1 WHERE id = p_user_id;
    UPDATE portfolios SET is_published = TRUE WHERE id = p_portfolio_id;
    
    RETURN TRUE;
END;
$$;

-- Approve payment function
CREATE OR REPLACE FUNCTION approve_payment(
    request_id UUID,
    admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_credits INTEGER;
    v_status TEXT;
BEGIN
    SELECT user_id, credits_requested, status INTO v_user_id, v_credits, v_status
    FROM payment_requests WHERE id = request_id;
    
    IF v_status != 'pending' THEN
        RAISE EXCEPTION 'Already processed';
    END IF;
    
    UPDATE user_profiles SET credits = credits + v_credits WHERE id = v_user_id;
    UPDATE payment_requests SET status = 'approved', processed_by = admin_id, processed_at = NOW()
    WHERE id = request_id;
    
    RETURN TRUE;
END;
$$;

-- ============================================================================
-- STEP 6: CREATE TRIGGERS
-- ============================================================================

-- Auto-create profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Timestamp updaters
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: ENABLE RLS
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 8: CREATE RLS POLICIES
-- ============================================================================

-- User Profiles
CREATE POLICY "Users view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON user_profiles FOR SELECT 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Portfolios
CREATE POLICY "Users view own portfolios" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public view published" ON portfolios FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Users insert own" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own" ON portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own" ON portfolios FOR DELETE USING (auth.uid() = user_id);

-- Payment Requests
CREATE POLICY "Users view own requests" ON payment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create requests" ON payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all requests" ON payment_requests FOR SELECT 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins update requests" ON payment_requests FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Public tables
CREATE POLICY "Anyone view professions" ON professions FOR SELECT USING (TRUE);
CREATE POLICY "Anyone view themes" ON themes FOR SELECT USING (TRUE);

-- Grant access to authenticated users
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;

-- ============================================================================
-- DONE!
-- ============================================================================

SELECT 'DATABASE SETUP COMPLETE' as status;