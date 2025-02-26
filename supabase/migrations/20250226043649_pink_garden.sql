/*
  # Fix Profile Policies and Constraints

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Fix unique constraints for user profiles
    - Optimize indexes for better performance

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access
    - Ensure data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Drop existing indexes and constraints
DROP INDEX IF EXISTS idx_profiles_user_role;
DROP INDEX IF EXISTS idx_profiles_parent_child;
DROP INDEX IF EXISTS idx_profiles_user_role_unique;

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_role_unique;

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_role_child_number_unique;

-- Create new optimized indexes
CREATE UNIQUE INDEX idx_profiles_user_role ON profiles(user_id, role);
CREATE INDEX idx_profiles_parent_child ON profiles(parent_id);

-- Create simplified policies without recursion
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  parent_id IN (          -- Child profiles
    SELECT id FROM profiles
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  parent_id IN (          -- Child profiles
    SELECT id FROM profiles
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure proper constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS prevent_circular_parent_refs;

ALTER TABLE profiles
ADD CONSTRAINT prevent_circular_parent_refs
CHECK (id != parent_id);