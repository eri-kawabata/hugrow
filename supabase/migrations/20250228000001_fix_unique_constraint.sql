/*
  # Fix unique constraint in profiles table

  1. Changes
    - Drop existing unique constraint on user_id
    - Create a new unique constraint on user_id and role combination
*/

-- Drop existing unique constraint on user_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_user_id'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT unique_user_id;
  END IF;
END $$;

-- Drop any existing unique indexes that might conflict
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'profiles_user_id_role_unique'
  ) THEN
    DROP INDEX profiles_user_id_role_unique;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'profiles_user_role_idx'
  ) THEN
    DROP INDEX profiles_user_role_idx;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_profiles_user_role'
  ) THEN
    DROP INDEX idx_profiles_user_role;
  END IF;
END $$;

-- Create a new unique constraint on user_id and role combination
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_role_unique ON profiles(user_id, role);

-- Update RLS policies to ensure proper access control
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    role = 'child' AND -- Child profile
    parent_id IN (
      SELECT id FROM profiles
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
      SELECT id FROM profiles
      WHERE user_id = auth.uid() AND role = 'parent'
    )
  )
);

CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id); 