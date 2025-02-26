/*
  # Fix Profile Policies and Constraints

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Fix parent-child relationship handling
    - Update indexes for better performance

  2. Security
    - Maintain proper access control
    - Prevent circular references
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Drop existing indexes
DROP INDEX IF EXISTS profiles_user_id_idx;
DROP INDEX IF EXISTS profiles_role_idx;
DROP INDEX IF EXISTS profiles_parent_child_idx;

-- Ensure all required columns exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS birthdate date,
ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('child', 'parent')),
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS child_number integer,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create new indexes
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_parent_child_idx ON profiles(parent_id, role);

-- Create new simplified policies
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

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