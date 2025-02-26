/*
  # Fix Profile Table Structure and Policies

  1. Changes
    - Reset profile table structure with all required columns
    - Create proper indexes with unique names
    - Simplify RLS policies to prevent recursion
    - Add parent-child relationship support

  2. Security
    - Maintain proper access control
    - Prevent circular references
    - Ensure data integrity
*/

-- Reset profile table structure
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS birthdate date,
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('child', 'parent')),
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS child_number integer,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Drop existing constraints and indexes safely
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_user_id_role_unique'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_role_unique;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'profiles_user_id_idx'
  ) THEN
    DROP INDEX profiles_user_id_idx;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'profiles_role_idx'
  ) THEN
    DROP INDEX profiles_role_idx;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'profiles_parent_child_idx'
  ) THEN
    DROP INDEX profiles_parent_child_idx;
  END IF;
END $$;

-- Create new constraints
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_role_unique_new UNIQUE (user_id, role);

-- Create optimized indexes with unique names
CREATE INDEX profiles_user_id_idx_new ON profiles(user_id);
CREATE INDEX profiles_role_idx_new ON profiles(role);
CREATE INDEX profiles_parent_child_idx_new ON profiles(parent_id, role);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create simplified policies without recursion
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    role = 'child' AND -- Child profile
    parent_id IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid() AND role = 'parent'
      LIMIT 1
    )
  )
);

CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    role = 'child' AND -- Child profile
    parent_id IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid() AND role = 'parent'
      LIMIT 1
    )
  )
);

CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();