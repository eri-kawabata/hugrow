/*
  # Add is_read column to work_feedback table
  
  Description:
  - Add is_read boolean column with default value false
  - Update existing records to have is_read = false if they don't have a value
*/

-- Add is_read column if it doesn't exist
ALTER TABLE work_feedback ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Update existing records to have is_read = false if they don't already have a value
UPDATE work_feedback SET is_read = false WHERE is_read IS NULL; 