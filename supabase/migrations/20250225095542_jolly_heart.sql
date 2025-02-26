/*
  # Fix achievements migration

  1. Changes
    - Add IF NOT EXISTS checks for achievements
    - Use DO blocks for safe inserts
    - Preserve existing achievements data

  2. Security
    - Maintain existing RLS policies
    - Keep all security settings intact
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
CREATE POLICY "streaks_select_policy"
  ON streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "streaks_insert_policy"
  ON streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streaks_update_policy"
  ON streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 実績のポリシー
CREATE POLICY "achievements_select_policy"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- ユーザー実績のポリシー
CREATE POLICY "user_achievements_select_policy"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_insert_policy"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 初期実績データの安全な挿入
DO $$
BEGIN
  -- streak-3
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE id = 'streak-3') THEN
    INSERT INTO achievements (id, title, description, icon_url, category, required_value, reward_points)
    VALUES ('streak-3', '3日連続チャレンジ', '3日連続で学習を続けました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak3', 'streak', 3, 100);
  END IF;

  -- streak-7
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE id = 'streak-7') THEN
    INSERT INTO achievements (id, title, description, icon_url, category, required_value, reward_points)
    VALUES ('streak-7', '週間マスター', '7日連続で学習を続けました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak7', 'streak', 7, 300);
  END IF;

  -- streak-30
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE id = 'streak-30') THEN
    INSERT INTO achievements (id, title, description, icon_url, category, required_value, reward_points)
    VALUES ('streak-30', '月間チャンピオン', '30日連続で学習を続けました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak30', 'streak', 30, 1000);
  END IF;

  -- challenge-5
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE id = 'challenge-5') THEN
    INSERT INTO achievements (id, title, description, icon_url, category, required_value, reward_points)
    VALUES ('challenge-5', 'チャレンジャー', '5つのチャレンジを完了しました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=challenge5', 'challenge', 5, 200);
  END IF;

  -- skill-80
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE id = 'skill-80') THEN
    INSERT INTO achievements (id, title, description, icon_url, category, required_value, reward_points)
    VALUES ('skill-80', 'スキルマスター', 'いずれかのスキルが80%に到達しました！', 'https://api.dicebear.com/7.x/shapes/svg?seed=skill80', 'skill', 80, 500);
  END IF;
END $$;