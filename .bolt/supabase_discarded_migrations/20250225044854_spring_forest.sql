-- タイムカプセルテーブルの作成
CREATE TABLE IF NOT EXISTS timecapsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  milestone_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- タイムカプセルアイテムテーブルの作成
CREATE TABLE IF NOT EXISTS timecapsule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid REFERENCES timecapsules ON DELETE CASCADE NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('work', 'sel_response')),
  item_id uuid NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- RLSの有効化
ALTER TABLE timecapsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE timecapsule_items ENABLE ROW LEVEL SECURITY;

-- タイムカプセルのポリシー
CREATE POLICY "Users can create their own timecapsules"
  ON timecapsules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own timecapsules"
  ON timecapsules
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- タイムカプセルアイテムのポリシー
CREATE POLICY "Users can create items in their timecapsules"
  ON timecapsule_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timecapsules
      WHERE timecapsules.id = capsule_id
      AND timecapsules.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items in their timecapsules"
  ON timecapsule_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timecapsules
      WHERE timecapsules.id = capsule_id
      AND timecapsules.user_id = auth.uid()
    )
  );