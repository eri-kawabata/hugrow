/*
  # SELクエストのAIフィードバック機能の追加

  1. 新しいテーブル
    - `sel_ai_feedback_templates`
      - `id` (uuid, primary key)
      - `emotion` (text) - 対象の感情
      - `intensity` (integer) - 感情の強度（1-5）
      - `feedback_template` (text) - フィードバックのテンプレート
      - `created_at` (timestamp)

  2. セキュリティ
    - RLSの有効化
    - 認証済みユーザーの読み取り権限を付与
*/

-- Create AI feedback templates table
CREATE TABLE IF NOT EXISTS sel_ai_feedback_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emotion text NOT NULL,
  intensity integer CHECK (intensity BETWEEN 1 AND 5) NOT NULL,
  feedback_template text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sel_ai_feedback_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for reading templates
CREATE POLICY "Authenticated users can read feedback templates"
  ON sel_ai_feedback_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial feedback templates
INSERT INTO sel_ai_feedback_templates (emotion, intensity, feedback_template) VALUES
  ('とてもうれしい', 5, 'すごくうれしそうだね！その気持ちを大切にしよう！'),
  ('うれしい', 4, 'いい気持ちだね。どんなことがあったのかな？'),
  ('ふつう', 3, 'いつもと変わらない一日かな。でも、小さな発見があったかもしれないね'),
  ('すこしかなしい', 2, 'すこし気持ちが沈んでいるのかな。大丈夫、明日はきっといい日になるよ'),
  ('かなしい', 1, 'つらい気持ちなんだね。そんな時は誰かに話してみるのもいいかもしれないよ');