-- Drop existing select policy
DROP POLICY IF EXISTS "Users can view feedback for their works" ON work_feedback;

-- Create updated select policy
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