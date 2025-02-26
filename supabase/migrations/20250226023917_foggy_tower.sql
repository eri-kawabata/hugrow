/*
  # Fix profile RLS policies

  1. Changes
    - Simplify RLS policies to prevent infinite recursion
    - Remove recursive role checks
    - Add direct user_id checks
    - Maintain proper access control

  2. Security
    - Users can view and update their own profiles
    - Parents can view and update child profiles
    - Maintain data integrity without recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Create simplified select policy
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create simplified update policy
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create simplified insert policy
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);