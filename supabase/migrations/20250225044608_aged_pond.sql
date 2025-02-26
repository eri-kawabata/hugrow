/*
  # タイムカプセルのテーブル構造の修正

  1. 変更内容
    - 既存のtimecapsule_itemsテーブルを削除
    - 作品とSELレスポンス用の個別テーブルを作成
    - 外部キー制約で参照整合性を確保

  2. セキュリティ
    - 新しいテーブルにRLSを適用
    - ユーザーごとのアクセス制御を設定
*/

-- Drop existing items table if it exists
DROP TABLE IF EXISTS timecapsule_items;

-- Create separate tables for each item type
CREATE TABLE IF NOT EXISTS timecapsule_work_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid REFERENCES timecapsules ON DELETE CASCADE NOT NULL,
  work_id uuid REFERENCES works ON DELETE CASCADE NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timecapsule_sel_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid REFERENCES timecapsules ON DELETE CASCADE NOT NULL,
  sel_response_id uuid REFERENCES sel_responses ON DELETE CASCADE NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE timecapsule_work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timecapsule_sel_items ENABLE ROW LEVEL SECURITY;

-- Create policies for work items
CREATE POLICY "Users can create work items in their timecapsules"
  ON timecapsule_work_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timecapsules
      WHERE timecapsules.id = capsule_id
      AND timecapsules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view work items in their timecapsules"
  ON timecapsule_work_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timecapsules
      WHERE timecapsules.id = capsule_id
      AND timecapsules.user_id = auth.uid()
    )
  );

-- Create policies for SEL items
CREATE POLICY "Users can create SEL items in their timecapsules"
  ON timecapsule_sel_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timecapsules
      WHERE timecapsules.id = capsule_id
      AND timecapsules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view SEL items in their timecapsules"
  ON timecapsule_sel_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timecapsules
      WHERE timecapsules.id = capsule_id
      AND timecapsules.user_id = auth.uid()
    )
  );