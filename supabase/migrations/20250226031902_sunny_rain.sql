/*
  # 複数の子供のプロフィール対応

  1. Changes
    - Add child_number column to profiles table
    - Add composite unique constraint for user_id, role, and child_number
    - Update RLS policies to support multiple child profiles

  2. Security
    - Parents can view and update their children's profiles
    - Children can only view and update their own profile
*/

-- Add child_number column
ALTER TABLE profiles
ADD COLUMN child_number integer DEFAULT 1;

-- Drop existing unique constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_role_unique;

-- Add new composite unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_role_child_number_unique 
UNIQUE (user_id, role, child_number);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create new policies
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

CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role_child_number 
ON profiles(user_id, role, child_number);
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id 
ON profiles(parent_id);