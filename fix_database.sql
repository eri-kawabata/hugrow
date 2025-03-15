-- profile_idカラムが存在しない場合は追加
ALTER TABLE works ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id);

-- 既存の作品データを更新（各作品にprofile_idを設定）
UPDATE works w
SET profile_id = (
  SELECT p.id 
  FROM profiles p 
  WHERE p.user_id = w.user_id 
  AND p.role = 'child'
  LIMIT 1
)
WHERE profile_id IS NULL;

-- profile_idに対するインデックスを作成
CREATE INDEX IF NOT EXISTS works_profile_id_idx ON works(profile_id);

-- 作品テーブルのRLSポリシーを更新
DROP POLICY IF EXISTS "Users can view all works" ON works;
CREATE POLICY "Users can view works by profile" ON works
FOR SELECT
TO authenticated
USING (
  -- 自分の作品を見ることができる
  auth.uid() = user_id
  OR
  -- 親は子供の作品を見ることができる
  EXISTS (
    SELECT 1 FROM profiles parent
    WHERE parent.user_id = auth.uid()
    AND parent.role = 'parent'
    AND EXISTS (
      SELECT 1 FROM profiles child
      WHERE child.id = works.profile_id
      AND child.parent_id = parent.id
    )
  )
);

-- 作品作成ポリシーを更新
DROP POLICY IF EXISTS "Users can create their own works" ON works;
CREATE POLICY "Users can create works" ON works
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- 作品更新ポリシーを更新
DROP POLICY IF EXISTS "Users can update their own works" ON works;
CREATE POLICY "Users can update works" ON works
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM profiles parent
    WHERE parent.user_id = auth.uid()
    AND parent.role = 'parent'
    AND EXISTS (
      SELECT 1 FROM profiles child
      WHERE child.id = works.profile_id
      AND child.parent_id = parent.id
    )
  )
);

-- 作品削除ポリシーを追加
DROP POLICY IF EXISTS "Users can delete works" ON works;
CREATE POLICY "Users can delete works" ON works
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM profiles parent
    WHERE parent.user_id = auth.uid()
    AND parent.role = 'parent'
    AND EXISTS (
      SELECT 1 FROM profiles child
      WHERE child.id = works.profile_id
      AND child.parent_id = parent.id
    )
  )
); 