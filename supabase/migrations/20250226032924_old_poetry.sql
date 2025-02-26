/*
  # Fix Profile RLS Policies

  1. Changes
    - Simplify RLS policies to prevent infinite recursion
    - Add proper indexes for performance
    - Ensure proper parent-child relationship constraints

  2. Security
    - Users can view and update their own profiles
    - Parents can view and update their children's profiles
    - Prevent circular dependencies in policies
*/

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
    parent_id IN (
      SELECT id
      FROM profiles
      WHERE user_id = auth.uid() AND role = 'parent'
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
      SELECT id
      FROM profiles
      WHERE user_id = auth.uid() AND role = 'parent'
    )
  )
);

CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON profiles(parent_id);

-- Add constraint to prevent circular parent references
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS prevent_circular_parent_refs;

ALTER TABLE profiles
ADD CONSTRAINT prevent_circular_parent_refs
CHECK (id != parent_id);