/*
  # Fix Profile RLS Policies

  1. Changes
    - Simplify RLS policies to avoid recursion
    - Ensure proper parent-child relationship
    - Fix profile viewing and updating permissions

  2. Security
    - Parents can view and update their own and children's profiles
    - Children can only view and update their own profiles
    - All users can create their own profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create new simplified policies

-- View policy
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    role = 'child' AND -- Child profile
    EXISTS (
      SELECT 1
      FROM profiles parent
      WHERE parent.user_id = auth.uid()
      AND parent.role = 'parent'
      AND profiles.parent_id = parent.id
    )
  )
);

-- Update policy
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    role = 'child' AND -- Child profile
    EXISTS (
      SELECT 1
      FROM profiles parent
      WHERE parent.user_id = auth.uid()
      AND parent.role = 'parent'
      AND profiles.parent_id = parent.id
    )
  )
);

-- Insert policy
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON profiles(parent_id);