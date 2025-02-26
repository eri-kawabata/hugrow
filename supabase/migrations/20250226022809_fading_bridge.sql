/*
  # Fix profile policies and constraints

  1. Changes
    - Drop existing policies
    - Create new simplified policies without recursion
    - Maintain proper access control for parent-child relationships

  2. Security
    - Users can view and manage their own profiles
    - Parents can manage child profiles
    - Prevent infinite recursion in policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add or update composite unique constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_role_unique;

ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);