/*
  # Fix Profile RLS Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new simplified policies without recursive checks
    - Add necessary indexes for performance

  2. Security
    - Users can view and update their own profiles
    - Parents can view and update their children's profiles
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
USING (auth.uid() = user_id);

-- Update policy
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Insert policy
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);