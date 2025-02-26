/*
  # モチベーション機能のテーブル作成

  1. 新しいテーブル
    - `streaks`: ユーザーの継続学習記録
    - `achievements`: 達成可能な実績一覧
    - `user_achievements`: ユーザーが獲得した実績

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - ユーザーは自分のデータのみアクセス可能
*/

-- ストリークテーブル
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 実績テーブル
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon_url text NOT NULL,
  category text NOT NULL,
  required_value integer NOT NULL,
  reward_points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ユーザー実績テーブル
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- RLSの有効化
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ストリークのポリシー
CREATE POLICY "Users can view their own streak data"
  ON streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak data"
  ON streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak data"
  ON streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 実績のポリシー
CREATE POLICY "Anyone can view achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- ユーザー実績のポリシー
CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 初期実績データの挿入
INSERT INTO achievements (id, title, description, icon_url, category, required_value, reward_points) VALUES
  ('streak-3', '3日連続チャレンジ', '3日連続で学習を続けました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak3', 'streak', 3, 100),
  ('streak-7', '週間マスター', '7日連続で学習を続けました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak7', 'streak', 7, 300),
  ('streak-30', '月間チャンピオン', '30日連続で学習を続けました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak30', 'streak', 30, 1000),
  ('challenge-5', 'チャレンジャー', '5つのチャレンジを完了しました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=challenge5', 'challenge', 5, 200),
  ('skill-80', 'スキルマスター', 'いずれかのスキルが80%に到達しました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=skill80', 'skill', 80, 500);