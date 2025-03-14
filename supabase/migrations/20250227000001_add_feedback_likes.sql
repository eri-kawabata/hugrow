/*
  # Add feedback likes table

  1. New Tables
    - `feedback_likes`
      - `id` (uuid, primary key)
      - `feedback_id` (uuid, references work_feedback)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `feedback_likes` table
    - Add policies for authenticated users
*/

-- Create feedback likes table
CREATE TABLE IF NOT EXISTS feedback_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid REFERENCES work_feedback(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- 同じユーザーが同じフィードバックに複数回いいねできないように制約を追加
  UNIQUE(feedback_id, user_id)
);

-- Enable RLS
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create likes"
  ON feedback_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- 親ユーザーのみがいいねを作成できる
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'parent'
    )
  );

CREATE POLICY "Users can delete their own likes"
  ON feedback_likes
  FOR DELETE
  TO authenticated
  USING (
    -- 自分のいいねのみ削除可能
    user_id = auth.uid()
  );

CREATE POLICY "Users can view likes"
  ON feedback_likes
  FOR SELECT
  TO authenticated
  USING (
    -- 認証済みユーザーはいいねを閲覧できる
    true
  );

-- いいね数を取得するためのビューを作成
CREATE OR REPLACE VIEW feedback_likes_count AS
SELECT 
  feedback_id,
  COUNT(*) as count
FROM 
  feedback_likes
GROUP BY 
  feedback_id;

-- インデックスを作成してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS feedback_likes_feedback_id_idx ON feedback_likes(feedback_id);
CREATE INDEX IF NOT EXISTS feedback_likes_user_id_idx ON feedback_likes(user_id); 