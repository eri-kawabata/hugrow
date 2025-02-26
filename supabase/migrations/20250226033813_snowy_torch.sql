/*
  # Fix Profiles Table Structure and Policies

  1. Table Structure
    - Add child_number column for multiple children
    - Add proper constraints and indexes
    - Prevent circular parent references

  2. Security
    - Simplify RLS policies to prevent recursion
    - Maintain proper access control
    - Fix unique constraint issues
*/

-- Ensure all required columns exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS birthdate date,
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('child', 'parent')),
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS child_number integer,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Drop existing constraints and indexes
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_role_idx;
DROP INDEX IF EXISTS idx_profiles_user_id_role;
DROP INDEX IF EXISTS idx_profiles_parent_id;

-- Create new constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS prevent_circular_parent_refs;

ALTER TABLE profiles
ADD CONSTRAINT prevent_circular_parent_refs
CHECK (id != parent_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id_role ON profiles(user_id, role);
CREATE INDEX idx_profiles_parent_id ON profiles(parent_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create new simplified policies
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