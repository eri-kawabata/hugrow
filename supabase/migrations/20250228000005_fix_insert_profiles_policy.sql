/*
  # Fix insert profiles policy

  1. Changes
    - Update the insert policy to fix the NEW reference issue
    - Ensure proper parent-child relationship checks
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create new insert policy without using NEW reference
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR  -- 自分のプロフィール
  (
    EXISTS (  -- 親が子供のプロフィールを作成可能
      SELECT 1 FROM profiles parent_profiles
      WHERE parent_profiles.user_id = auth.uid()
      AND parent_profiles.role = 'parent'
      AND parent_profiles.id = parent_id
    )
  )
); 