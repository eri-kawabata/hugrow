/*
  # Add stored procedure for inserting child profiles

  1. Changes
    - Create a function to insert child profiles with a custom ID
    - This bypasses the unique constraint issues
*/

-- Create a function to insert child profiles
CREATE OR REPLACE FUNCTION insert_child_profile(
  p_user_id UUID,
  p_username TEXT,
  p_birthdate DATE,
  p_parent_id UUID,
  p_child_number INTEGER,
  p_random_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (
    id,
    user_id,
    username,
    birthdate,
    role,
    parent_id,
    child_number,
    created_at,
    updated_at
  ) VALUES (
    p_random_id,
    p_user_id,
    p_username,
    p_birthdate,
    'child',
    p_parent_id,
    p_child_number,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 