/*
  # Fix RLS policies for blood pressure and blood sugar tables

  1. Security Updates
    - Drop existing policies that use incorrect `uid()` function
    - Create new policies using correct `auth.uid()` function
    - Ensure proper RLS policies for both blood_pressure_readings and blood_sugar_readings tables
    
  2. Policy Changes
    - SELECT: Users can view their own readings
    - INSERT: Users can insert their own readings  
    - UPDATE: Users can update their own readings
    - DELETE: Users can delete their own readings
*/

-- Drop existing policies for blood_pressure_readings
DROP POLICY IF EXISTS "Users can view own blood pressure readings" ON blood_pressure_readings;
DROP POLICY IF EXISTS "Users can insert own blood pressure readings" ON blood_pressure_readings;
DROP POLICY IF EXISTS "Users can update own blood pressure readings" ON blood_pressure_readings;
DROP POLICY IF EXISTS "Users can delete own blood pressure readings" ON blood_pressure_readings;

-- Create new policies for blood_pressure_readings with correct auth.uid()
CREATE POLICY "Users can view own blood pressure readings"
  ON blood_pressure_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blood pressure readings"
  ON blood_pressure_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blood pressure readings"
  ON blood_pressure_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blood pressure readings"
  ON blood_pressure_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for blood_sugar_readings
DROP POLICY IF EXISTS "Users can view own blood sugar readings" ON blood_sugar_readings;
DROP POLICY IF EXISTS "Users can insert own blood sugar readings" ON blood_sugar_readings;
DROP POLICY IF EXISTS "Users can update own blood sugar readings" ON blood_sugar_readings;
DROP POLICY IF EXISTS "Users can delete own blood sugar readings" ON blood_sugar_readings;

-- Create new policies for blood_sugar_readings with correct auth.uid()
CREATE POLICY "Users can view own blood sugar readings"
  ON blood_sugar_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own blood sugar readings"
  ON blood_sugar_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own blood sugar readings"
  ON blood_sugar_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own blood sugar readings"
  ON blood_sugar_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create new policies for user_profiles with correct auth.uid()
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);