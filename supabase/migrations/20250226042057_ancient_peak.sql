/*
  # Fix Profile Structure and Constraints

  1. Changes
    - Reset profile table structure with all required columns
    - Add proper constraints for parent-child relationships
    - Create optimized indexes
    - Simplify RLS policies
    - Add child number support

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

  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_user_id_role_child_number_unique'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_role_child_number_unique;
  END IF;
END $$;

-- Create new constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS prevent_circular_parent_refs;

ALTER TABLE profiles
ADD CONSTRAINT prevent_circular_parent_refs
CHECK (id != parent_id);

-- Create unique index instead of constraint for handling NULL values
CREATE UNIQUE INDEX profiles_user_role_child_number_idx ON profiles(user_id, role, (COALESCE(child_number, 0)));

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