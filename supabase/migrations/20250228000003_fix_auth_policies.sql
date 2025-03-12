/*
  # Fix authentication policies

  1. Changes
    - Update RLS policies to ensure proper authentication
    - Allow users to create their own profiles
    - Fix profile retrieval issues
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON profiles;

-- Create simplified policies for viewing profiles
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);  -- すべての認証済みユーザーがプロフィールを閲覧可能

-- Create policy for updating profiles
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR  -- 自分のプロフィール
  (
    EXISTS (  -- 親が子供のプロフィールを更新可能
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'parent'
      AND id = profiles.parent_id
    )
  )
);

-- Create policy for inserting profiles
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

-- Create policy for deleting profiles
CREATE POLICY "Users can delete profiles"
ON profiles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR  -- 自分のプロフィール
  (
    EXISTS (  -- 親が子供のプロフィールを削除可能
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'parent'
      AND id = profiles.parent_id
    )
  )
); 