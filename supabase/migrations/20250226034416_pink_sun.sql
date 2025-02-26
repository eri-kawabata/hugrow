/*
  # Fix Profiles Table Policies

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Use EXISTS instead of IN for better performance
    - Add proper indexes for query optimization

  2. Security
    - Maintain proper access control for parent/child relationships
    - Prevent circular references
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

-- Ensure proper indexes exist
DROP INDEX IF EXISTS profiles_user_id_role_idx;
DROP INDEX IF EXISTS profiles_parent_id_idx;

CREATE INDEX profiles_user_id_role_idx ON profiles(user_id, role);
CREATE INDEX profiles_parent_id_idx ON profiles(parent_id);