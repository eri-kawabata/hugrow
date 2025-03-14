/*
  # Fix insert_child_profile function

  1. Changes
    - Modify the function to check if birthdate or birthday column exists
    - Use the appropriate column name based on the check
*/

-- Create a function to insert child profiles with column check
CREATE OR REPLACE FUNCTION insert_child_profile(
  p_user_id UUID,
  p_username TEXT,
  p_birthdate DATE,
  p_parent_id UUID,
  p_child_number INTEGER,
  p_random_id UUID
)
RETURNS VOID AS $$
DECLARE
  has_birthdate BOOLEAN;
  has_birthday BOOLEAN;
BEGIN
  -- Check if birthdate column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birthdate'
  ) INTO has_birthdate;
  
  -- Check if birthday column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birthday'
  ) INTO has_birthday;
  
  -- Insert using the appropriate column
  IF has_birthdate THEN
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
  ELSIF has_birthday THEN
    INSERT INTO profiles (
      id,
      user_id,
      username,
      birthday,
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
  ELSE
    -- If neither column exists, insert without birthdate/birthday
    INSERT INTO profiles (
      id,
      user_id,
      username,
      role,
      parent_id,
      child_number,
      created_at,
      updated_at
    ) VALUES (
      p_random_id,
      p_user_id,
      p_username,
      'child',
      p_parent_id,
      p_child_number,
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 