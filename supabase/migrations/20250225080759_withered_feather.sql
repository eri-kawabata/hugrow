/*
  # 学習機能のテーブル作成

  1. 新規テーブル
    - `learning_progress`: 学習の進捗を記録
      - `id` (uuid, primary key)
      - `user_id` (uuid, 外部キー)
      - `lesson_id` (text)
      - `completed` (boolean)
      - `last_position` (number)
      - `quiz_score` (number, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `badges`: 獲得可能なバッジ
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon_url` (text)
      - `category` (text)
      - `required_points` (integer)
      - `created_at` (timestamp)

    - `user_badges`: ユーザーが獲得したバッジ
      - `id` (uuid, primary key)
      - `user_id` (uuid, 外部キー)
      - `badge_id` (uuid, 外部キー)
      - `earned_at` (timestamp)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - ユーザーは自分の進捗のみ閲覧・更新可能
    - バッジ情報は全ユーザーが閲覧可能
    - ユーザーバッジは自分のものだけ閲覧可能
*/

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id text NOT NULL,
  completed boolean DEFAULT false,
  last_position numeric DEFAULT 0,
  quiz_score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon_url text NOT NULL,
  category text NOT NULL,
  required_points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for learning_progress
CREATE POLICY "learning_progress_select_policy"
  ON learning_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "learning_progress_insert_policy"
  ON learning_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_progress_update_policy"
  ON learning_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for badges
CREATE POLICY "badges_select_policy"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_badges
CREATE POLICY "user_badges_select_policy"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_policy"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert initial science badges
INSERT INTO badges (name, description, icon_url, category, required_points) VALUES
  ('科学探検家', '最初の科学レッスンを完了', 'https://api.dicebear.com/7.x/shapes/svg?seed=explorer', 'science', 100),
  ('実験マスター', '5つの実験を成功', 'https://api.dicebear.com/7.x/shapes/svg?seed=master', 'science', 500),
  ('観察の達人', '10回の観察記録を達成', 'https://api.dicebear.com/7.x/shapes/svg?seed=observer', 'science', 1000);