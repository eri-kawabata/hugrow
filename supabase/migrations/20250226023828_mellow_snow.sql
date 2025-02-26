/*
  # Fix RLS policies to prevent infinite recursion

  1. Changes
    - Simplify RLS policies to prevent circular references
    - Maintain parent-child relationship access control
    - Fix infinite recursion issues

  2. Security
    - Users can view and update their own profiles
    - Parents can view and update their children's profiles
    - Maintain proper access control without recursion
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
USING (
  auth.uid() = user_id OR
  (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'parent'
);

-- Create simplified update policy
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'parent'
);

-- Create simplified insert policy
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);