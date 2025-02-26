/*
  # Simplify Profile Policies

  1. Changes
    - Remove all recursive policy conditions
    - Simplify access control to basic user_id checks
    - Maintain proper indexes for performance

  2. Security
    - Maintain basic access control
    - Prevent unauthorized access
    - Keep data integrity constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_profiles_user_role;
DROP INDEX IF EXISTS idx_profiles_parent_child;

-- Create new optimized indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_parent_id ON profiles(parent_id);

-- Create maximally simplified policies
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

-- Ensure proper constraints
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS prevent_circular_parent_refs;

ALTER TABLE profiles
ADD CONSTRAINT prevent_circular_parent_refs
CHECK (id != parent_id);