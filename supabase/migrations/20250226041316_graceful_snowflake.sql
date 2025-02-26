/*
  # Fix Profile System

  1. Changes
    - Reset profile table structure
    - Add required columns with proper constraints
    - Create optimized indexes
    - Implement simplified RLS policies

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

-- Drop existing constraints and indexes
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_role_unique;
DROP INDEX IF EXISTS profiles_user_id_new_idx;
DROP INDEX IF EXISTS profiles_role_new_idx;
DROP INDEX IF EXISTS profiles_parent_child_new_idx;

-- Create new constraints
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);

-- Create optimized indexes
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_parent_child_idx ON profiles(parent_id, role);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    role = 'child' AND -- Child profile
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'parent'
      AND profiles.parent_id = p.id
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
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'parent'
      AND profiles.parent_id = p.id
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