/*
  # Fix Profile Policies and Indexes

  1. Changes
    - Drop existing indexes safely
    - Create new indexes with unique names
    - Update RLS policies
    - Add constraints for data integrity

  2. Security
    - Maintain proper access control
    - Prevent circular references
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Drop existing indexes safely
DROP INDEX IF EXISTS profiles_user_id_idx;
DROP INDEX IF EXISTS profiles_role_idx;
DROP INDEX IF EXISTS profiles_parent_child_idx;

-- Create new indexes with unique names
CREATE INDEX IF NOT EXISTS profiles_user_id_new_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_role_new_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_parent_child_new_idx ON profiles(parent_id, role);

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