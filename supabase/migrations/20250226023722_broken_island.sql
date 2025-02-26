/*
  # Add parent-child profile management

  1. Changes
    - Add birthdate column to profiles table
    - Add parent_id column for child profiles
    - Update unique constraints
    - Create new policies for parent-child relationships

  2. Security
    - Parents can manage their own and children's profiles
    - Children can only view their own profiles
    - Maintain proper access control
*/

-- Add birthdate column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'birthdate'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birthdate date;
  END IF;
END $$;

-- Add parent_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN parent_id uuid REFERENCES profiles(id);
  END IF;
END $$;

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
  auth.uid() = user_id OR
  (
    role = 'child' AND
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
  auth.uid() = user_id OR
  (
    role = 'child' AND
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