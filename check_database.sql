-- 作品テーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'works'
ORDER BY ordinal_position;

-- プロファイルテーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 作品データの確認（profile_idに注目）
SELECT id, title, user_id, profile_id, type, created_at
FROM works
ORDER BY created_at DESC
LIMIT 20;

-- プロファイルデータの確認
SELECT id, user_id, username, role, parent_id
FROM profiles
ORDER BY role, username;

-- 子供プロファイルごとの作品数を確認
SELECT p.id AS profile_id, p.username, COUNT(w.id) AS work_count
FROM profiles p
LEFT JOIN works w ON p.id = w.profile_id
WHERE p.role = 'child'
GROUP BY p.id, p.username
ORDER BY work_count DESC;

-- profile_idがNULLの作品を確認
SELECT id, title, user_id, type, created_at
FROM works
WHERE profile_id IS NULL
LIMIT 10;

-- 各ユーザーIDに関連付けられた子供プロファイルの数を確認
SELECT user_id, COUNT(*) AS profile_count
FROM profiles
WHERE role = 'child'
GROUP BY user_id
HAVING COUNT(*) > 0;

-- 親子関係の確認
SELECT 
    parent.id AS parent_id, 
    parent.username AS parent_name,
    child.id AS child_id,
    child.username AS child_name
FROM profiles parent
JOIN profiles child ON parent.id = child.parent_id
WHERE parent.role = 'parent' AND child.role = 'child'
ORDER BY parent.username, child.username; 