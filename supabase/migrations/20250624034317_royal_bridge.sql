/*
  # Add Admin Role to User Profiles

  1. Changes
    - Add `is_admin` boolean column to user_profiles table
    - Set default value to false
    - Add index for faster queries on admin status
*/

-- Add is_admin column to user_profiles
ALTER TABLE IF EXISTS user_profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin 
ON user_profiles(is_admin);

-- Create a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;