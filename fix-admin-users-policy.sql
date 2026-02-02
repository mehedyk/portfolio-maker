-- ============================================
-- Fix: Add Admin Policy to View All Users
-- ============================================
-- Run this in Supabase SQL Editor
-- This allows admins to view all user profiles in the admin panel
-- ============================================

-- Add policy for admins to view all user profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
