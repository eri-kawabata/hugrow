/*
  # Add function to add birthdate column

  1. Changes
    - Create a function to add birthdate column if it doesn't exist
    - This can be called from the client to fix schema issues
*/

-- Create a function to add birthdate column
CREATE OR REPLACE FUNCTION add_birthdate_column()
RETURNS VOID AS $$
BEGIN
  -- Check if birthdate column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birthdate'
  ) THEN
    -- Add birthdate column
    ALTER TABLE profiles ADD COLUMN birthdate date;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 