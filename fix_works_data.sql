-- 既存の作品データを更新（各作品にprofile_idを正しく設定）
-- 各ユーザーIDに対応する子供プロファイルを特定して設定

-- まず、各ユーザーIDに対応する子供プロファイルを確認
SELECT user_id, COUNT(*) as profile_count
FROM profiles
WHERE role = 'child'
GROUP BY user_id
HAVING COUNT(*) > 1;

-- profile_idがNULLの作品を確認
SELECT id, title, user_id, type, created_at
FROM works
WHERE profile_id IS NULL;

-- 特定の作品（GINTOKI）のprofile_idを設定
-- 現在のデータでは、id: 4b8c93e6-674a-4b11-a513-b96a0a9dd2e8 の作品がNULLになっています
UPDATE works
SET profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'  -- Fukuの子供プロファイルID
WHERE id = '4b8c93e6-674a-4b11-a513-b96a0a9dd2e8';

-- 残りのprofile_idがNULLの作品を更新（一般的なケース）
UPDATE works w
SET profile_id = (
  SELECT p.id
  FROM profiles p
  WHERE p.user_id = w.user_id
  AND p.role = 'child'
  ORDER BY p.created_at  -- 最も古い子供プロファイルを選択
  LIMIT 1
)
WHERE profile_id IS NULL;

-- 作品を複数の子供プロファイルに分散させる
-- 現在すべての作品が一人の子供（Fuku）に関連付けられているため、
-- いくつかの作品を他の子供プロファイルに移動します

-- 子供プロファイルのIDを取得
SELECT id, username FROM profiles WHERE role = 'child' ORDER BY created_at;

-- 作品を他の子供プロファイルに分散させる
-- 最初の3つの作品を2番目の子供プロファイルに移動
UPDATE works
SET profile_id = '3b080850-7314-4efa-8aab-15d9525bc806'  -- 2番目の子供プロファイルID
WHERE profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'  -- Fukuの子供プロファイルID
AND id IN (
  SELECT id FROM works 
  WHERE profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'
  ORDER BY created_at DESC
  LIMIT 3
);

-- 次の3つの作品を3番目の子供プロファイルに移動
UPDATE works
SET profile_id = 'ac6a6bcd-1271-4de0-aea3-cf897d54ee01'  -- 3番目の子供プロファイルID
WHERE profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'  -- Fukuの子供プロファイルID
AND id IN (
  SELECT id FROM works 
  WHERE profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'
  ORDER BY created_at DESC
  LIMIT 3 OFFSET 3
);

-- 更新後の作品データを確認
SELECT id, user_id, profile_id, title, type, created_at
FROM works
ORDER BY created_at DESC
LIMIT 20;

-- 各プロファイルIDごとの作品数を確認
SELECT profile_id, COUNT(*) as work_count
FROM works
GROUP BY profile_id
ORDER BY work_count DESC;

-- profile_idがNULLの作品がまだある場合は再度確認
SELECT COUNT(*) FROM works WHERE profile_id IS NULL;

-- 作品とプロファイルの関連を確認
SELECT w.id, w.title, w.user_id, w.profile_id, 
       p.id as profile_id, p.username, p.role, p.user_id as profile_user_id
FROM works w
LEFT JOIN profiles p ON w.profile_id = p.id
ORDER BY w.created_at DESC
LIMIT 20;

-- profile_idカラムが存在しない場合は追加
ALTER TABLE works ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id);

-- 現在のデータ状態を確認
SELECT 'NULL profile_id count' AS check_type, COUNT(*) AS count
FROM works
WHERE profile_id IS NULL;

-- 各ユーザーの子供プロファイル数を確認
SELECT user_id, COUNT(*) AS child_profile_count
FROM profiles
WHERE role = 'child'
GROUP BY user_id;

-- 各ユーザーの作品数を確認
SELECT user_id, COUNT(*) AS work_count
FROM works
GROUP BY user_id;

-- 既存の作品データを更新（各作品にprofile_idを設定）
-- 各ユーザーの最初の子供プロファイルを使用
UPDATE works w
SET profile_id = (
  SELECT p.id 
  FROM profiles p 
  WHERE p.user_id = w.user_id 
  AND p.role = 'child'
  ORDER BY p.created_at
  LIMIT 1
)
WHERE profile_id IS NULL;

-- 更新後のデータ状態を確認
SELECT 'NULL profile_id count after update' AS check_type, COUNT(*) AS count
FROM works
WHERE profile_id IS NULL;

-- 各子供プロファイルごとの作品数を確認
SELECT p.id AS profile_id, p.username, COUNT(w.id) AS work_count
FROM profiles p
LEFT JOIN works w ON p.id = w.profile_id
WHERE p.role = 'child'
GROUP BY p.id, p.username
ORDER BY work_count DESC;

-- 作品を複数の子供プロファイルに分散させる（オプション）
-- 例：特定の作品を特定の子供プロファイルに割り当てる
-- UPDATE works
-- SET profile_id = '子供のプロファイルID'
-- WHERE title = '作品タイトル' AND profile_id IS NOT NULL;

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