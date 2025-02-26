/*
  # Add updated_at column to profiles table

  1. Changes
    - Add updated_at column to profiles table with default value of now()
    - Add trigger to automatically update updated_at on row update

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Adds trigger function if it doesn't exist
*/

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_profiles_updated_at'
  ) THEN
    CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;