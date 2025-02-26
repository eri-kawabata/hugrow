/*
  # Update profiles table constraints and policies

  1. Changes
    - Add composite unique constraint for user_id and role
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies with updated conditions
*/

-- Add composite unique constraint for user_id and role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_user_id_role_unique'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);
  END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);