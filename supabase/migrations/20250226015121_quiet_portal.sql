/*
  # Update profiles table constraints

  1. Changes
    - Drop existing unique constraint on user_id with CASCADE
    - Add new composite unique constraint for user_id and role
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies with updated conditions
*/

-- Drop existing unique constraint with CASCADE
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_key CASCADE;

-- Add composite unique constraint for user_id and role
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_role_unique UNIQUE (user_id, role);

-- Re-create foreign key constraint for work_feedback
ALTER TABLE work_feedback
ADD CONSTRAINT work_feedback_user_profiles_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

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