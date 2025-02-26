/*
  # Add work feedback table and policies

  1. New Tables
    - `work_feedback` (if not exists)
      - `id` (uuid, primary key)
      - `work_id` (uuid, references works)
      - `user_id` (uuid, references auth.users)
      - `feedback` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `work_feedback` table
    - Add policies for authenticated users (if not exist)
*/

-- Create work feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS work_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid REFERENCES works ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  feedback text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE work_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_feedback' 
    AND policyname = 'Users can create feedback for works'
  ) THEN
    CREATE POLICY "Users can create feedback for works"
      ON work_feedback
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'parent'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_feedback' 
    AND policyname = 'Users can view feedback for their works'
  ) THEN
    CREATE POLICY "Users can view feedback for their works"
      ON work_feedback
      FOR SELECT
      TO authenticated
      USING (
        -- 作品の所有者は自分のフィードバックを見ることができる
        EXISTS (
          SELECT 1 FROM works
          WHERE works.id = work_feedback.work_id
          AND works.user_id = auth.uid()
        )
        OR
        -- 親は自分が書いたフィードバックを見ることができる
        (
          work_feedback.user_id = auth.uid()
          AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'parent'
          )
        )
      );
  END IF;
END $$;