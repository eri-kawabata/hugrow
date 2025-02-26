/*
  # Fix feedback constraints and policies

  1. Changes
    - Drop existing foreign key constraint if exists
    - Drop existing policy if exists
    - Create updated policy with correct conditions

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for feedback viewing
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Users can view feedback for their works" ON work_feedback;

-- Create updated select policy with simplified conditions
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