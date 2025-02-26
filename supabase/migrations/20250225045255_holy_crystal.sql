/*
  # Fix RLS policies for SEL feedback table

  1. Security Updates
    - Enable RLS on sel_feedback table
    - Add policies for:
      - Inserting feedback (authenticated users)
      - Viewing feedback (users can view feedback for their own responses)

  2. Changes
    - Add missing RLS policies for sel_feedback table
    - Add existence checks to prevent duplicate policy errors
*/

-- Ensure RLS is enabled
ALTER TABLE sel_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting feedback if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sel_feedback' 
    AND policyname = 'Users can insert feedback'
  ) THEN
    CREATE POLICY "Users can insert feedback"
      ON sel_feedback
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM sel_responses
          WHERE sel_responses.id = response_id
          AND sel_responses.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create policy for viewing feedback if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sel_feedback' 
    AND policyname = 'Users can view feedback for their responses'
  ) THEN
    CREATE POLICY "Users can view feedback for their responses"
      ON sel_feedback
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM sel_responses
          WHERE sel_responses.id = response_id
          AND sel_responses.user_id = auth.uid()
        )
      );
  END IF;
END $$;