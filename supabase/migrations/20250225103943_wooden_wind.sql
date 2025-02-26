/*
  # Fix streaks table and error handling

  1. New Tables
    - Ensure streaks table exists with proper structure
    - Add proper constraints and defaults

  2. Security
    - Enable RLS on streaks table
    - Add policies for streak access
*/

-- ストリークテーブルが存在しない場合のみ作成
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- RLSの有効化
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- ストリークのポリシーを作成（存在しない場合のみ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'streaks' AND policyname = 'Users can view their own streak data'
  ) THEN
    CREATE POLICY "Users can view their own streak data"
      ON streaks
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'streaks' AND policyname = 'Users can insert their own streak data'
  ) THEN
    CREATE POLICY "Users can insert their own streak data"
      ON streaks
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'streaks' AND policyname = 'Users can update their own streak data'
  ) THEN
    CREATE POLICY "Users can update their own streak data"
      ON streaks
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;