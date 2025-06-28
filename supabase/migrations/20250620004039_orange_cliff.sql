/*
  # Health Monitoring Database Schema

  1. New Tables
    - `blood_pressure_readings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `systolic` (integer)
      - `diastolic` (integer)
      - `pulse` (integer, optional)
      - `location` (text)
      - `medication` (text, optional)
      - `symptoms` (text, optional)
      - `notes` (text, optional)
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `blood_sugar_readings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `glucose` (integer)
      - `test_type` (text)
      - `location` (text)
      - `medication` (text, optional)
      - `meal_info` (text, optional)
      - `symptoms` (text, optional)
      - `notes` (text, optional)
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `date_of_birth` (date, optional)
      - `emergency_contact` (text, optional)
      - `doctor_name` (text, optional)
      - `doctor_phone` (text, optional)
      - `medical_conditions` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for emergency contacts to view data (future feature)

  3. Indexes
    - Add indexes for efficient querying by user_id and recorded_at
*/

-- Create blood_pressure_readings table
CREATE TABLE IF NOT EXISTS blood_pressure_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  systolic integer NOT NULL CHECK (systolic >= 50 AND systolic <= 300),
  diastolic integer NOT NULL CHECK (diastolic >= 30 AND diastolic <= 200),
  pulse integer CHECK (pulse >= 30 AND pulse <= 200),
  location text DEFAULT 'home' CHECK (location IN ('home', 'clinic', 'hospital', 'pharmacy')),
  medication text,
  symptoms text,
  notes text,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blood_sugar_readings table
CREATE TABLE IF NOT EXISTS blood_sugar_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  glucose integer NOT NULL CHECK (glucose >= 20 AND glucose <= 600),
  test_type text NOT NULL CHECK (test_type IN ('fasting', 'random', 'post-meal', 'bedtime', 'pre-meal')),
  location text DEFAULT 'home' CHECK (location IN ('home', 'clinic', 'hospital', 'pharmacy')),
  medication text,
  meal_info text,
  symptoms text,
  notes text,
  recorded_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  date_of_birth date,
  emergency_contact text,
  doctor_name text,
  doctor_phone text,
  medical_conditions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE blood_pressure_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_sugar_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for blood_pressure_readings
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

-- Create policies for blood_sugar_readings
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

-- Create policies for user_profiles
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bp_readings_user_recorded 
  ON blood_pressure_readings(user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_bs_readings_user_recorded 
  ON blood_sugar_readings(user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_bp_readings_user_created 
  ON blood_pressure_readings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bs_readings_user_created 
  ON blood_sugar_readings(user_id, created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blood_pressure_readings_updated_at
  BEFORE UPDATE ON blood_pressure_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blood_sugar_readings_updated_at
  BEFORE UPDATE ON blood_sugar_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();