/*
  # Add support for multiple children profiles

  1. Changes
    - Add parent_id column to profiles table to link children to their parent
    - Add foreign key constraint to ensure parent exists
    - Update RLS policies to handle parent-child relationships

  2. Security
    - Parents can only view and manage their own children's profiles
    - Children can only view their own profile
*/

-- Add parent_id column to profiles table
ALTER TABLE profiles
ADD COLUMN parent_id uuid REFERENCES profiles(id);

-- Add foreign key constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_parent_child_fk
FOREIGN KEY (parent_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- View policy: Users can view their own profile and their children's profiles
CREATE POLICY "Users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR  -- Own profile
  parent_id IN (           -- Children's profiles
    SELECT id FROM profiles
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

-- Update policy: Users can update their own profile and their children's profiles
CREATE POLICY "Users can update profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR  -- Own profile
  parent_id IN (           -- Children's profiles
    SELECT id FROM profiles
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

-- Insert policy: Users can create profiles for themselves and their children
CREATE POLICY "Users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR  -- Own profile
  parent_id IN (           -- Children's profiles
    SELECT id FROM profiles
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);