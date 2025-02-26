/*
  # Fix Profile Management System

  1. Table Structure
    - Add parent_id column to link child profiles to parent profiles
    - Ensure proper constraints and indexes
  
  2. Security
    - Update RLS policies to allow proper access control
    - Parents can manage their own and children's profiles
    - Children can only access their own profile

  3. Changes
    - Drop existing constraints and recreate them
    - Add parent_id relationship
    - Update RLS policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON profiles;

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

-- Create new policies

-- View policy: Users can view their own profile and parents can view their children's profiles
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    EXISTS ( -- Parent viewing child profile
      SELECT 1 FROM profiles parent
      WHERE parent.user_id = auth.uid()
      AND parent.role = 'parent'
      AND profiles.parent_id = parent.id
    )
  )
);

-- Update policy: Users can update their own profile and parents can update their children's profiles
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR -- Own profile
  (
    EXISTS ( -- Parent updating child profile
      SELECT 1 FROM profiles parent
      WHERE parent.user_id = auth.uid()
      AND parent.role = 'parent'
      AND profiles.parent_id = parent.id
    )
  )
);

-- Insert policy: Users can create their own profiles
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON profiles(parent_id);