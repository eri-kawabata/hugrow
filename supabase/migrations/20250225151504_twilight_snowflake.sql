/*
  # Add work feedback table

  1. New Tables
    - `work_feedback`
      - `id` (uuid, primary key)
      - `work_id` (uuid, references works)
      - `user_id` (uuid, references auth.users)
      - `feedback` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `work_feedback` table
    - Add policies for authenticated users
*/

-- Create work feedback table
CREATE TABLE IF NOT EXISTS work_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id uuid REFERENCES works ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  feedback text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE work_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
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