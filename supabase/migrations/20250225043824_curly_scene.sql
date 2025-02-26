/*
  # SELクエスト機能のデータベース設計

  1. New Tables
    - `sel_quests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `emotion_type` (text)
      - `created_at` (timestamptz)

    - `sel_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `quest_id` (uuid, references sel_quests)
      - `emotion` (text)
      - `intensity` (integer)
      - `note` (text)
      - `created_at` (timestamptz)

    - `sel_feedback`
      - `id` (uuid, primary key)
      - `response_id` (uuid, references sel_responses)
      - `feedback_text` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create sel_quests table
CREATE TABLE IF NOT EXISTS sel_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  emotion_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sel_responses table
CREATE TABLE IF NOT EXISTS sel_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  quest_id uuid REFERENCES sel_quests ON DELETE CASCADE NOT NULL,
  emotion text NOT NULL,
  intensity integer CHECK (intensity BETWEEN 1 AND 5) NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create sel_feedback table
CREATE TABLE IF NOT EXISTS sel_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES sel_responses ON DELETE CASCADE NOT NULL,
  feedback_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sel_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sel_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sel_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for sel_quests
CREATE POLICY "Anyone can view quests"
  ON sel_quests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for sel_responses
CREATE POLICY "Users can create their own responses"
  ON sel_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses"
  ON sel_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for sel_feedback
CREATE POLICY "Users can view feedback for their responses"
  ON sel_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sel_responses
      WHERE sel_responses.id = sel_feedback.response_id
      AND sel_responses.user_id = auth.uid()
    )
  );

-- Insert initial SEL quests
INSERT INTO sel_quests (title, description, emotion_type) VALUES
  ('今日の気持ちを選ぼう', '今日はどんな気持ちかな？表情を選んでみよう', 'daily_mood'),
  ('うれしかったことは？', '今日、どんなことがうれしかったかな？', 'happiness'),
  ('むずかしかったことは？', '今日、チャレンジしたことを教えてね', 'challenge'),
  ('なかよしな気持ち', 'だれかとなかよくできたかな？', 'friendship');