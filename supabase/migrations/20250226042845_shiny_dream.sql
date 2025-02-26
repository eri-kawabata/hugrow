/*
  # Fix Profile RLS Policies

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Maintain proper access control for parent-child relationships
    - Optimize indexes for better performance

  2. Security
    - Ensure proper access control
    - Prevent unauthorized access
    - Maintain data integrity
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_profiles_user_role_unique;
DROP INDEX IF EXISTS idx_profiles_parent_id;

-- Create new optimized indexes
CREATE UNIQUE INDEX idx_profiles_user_role ON profiles(user_id, role);
CREATE INDEX idx_profiles_parent_child ON profiles(parent_id, role);

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
      SELECT p.id
      FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'parent'
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
      SELECT p.id
      FROM profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role = 'parent'
      LIMIT 1
    )
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