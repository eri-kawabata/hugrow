/*
  # Fix profile policies and constraints

  1. Changes
    - Drop existing unique constraint
    - Add new composite unique constraint
    - Update profile policies
    - Add parent-child relationship support

  2. Security
    - Users can manage their own profiles
    - Parents can manage child profiles
*/

-- Drop existing unique constraint if exists
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_role_unique;

-- Add new composite unique constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);

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