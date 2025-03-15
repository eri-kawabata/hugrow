-- 作品テーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'works'
ORDER BY ordinal_position;

-- 作品テーブルのデータ数を確認
SELECT COUNT(*) FROM works;

-- profile_idがNULLの作品を確認
SELECT COUNT(*) FROM works WHERE profile_id IS NULL;

-- 各ユーザーIDごとの作品数を確認
SELECT user_id, COUNT(*) as work_count
FROM works
GROUP BY user_id
ORDER BY work_count DESC;

-- 各プロファイルIDごとの作品数を確認
SELECT profile_id, COUNT(*) as work_count
FROM works
GROUP BY profile_id
ORDER BY work_count DESC;

-- 最新の作品10件を確認
SELECT id, user_id, profile_id, title, type, created_at
FROM works
ORDER BY created_at DESC
LIMIT 10;

-- 子供プロファイルの確認
SELECT id, user_id, parent_id, display_name, role
FROM profiles
WHERE role = 'child'
ORDER BY created_at DESC;

-- 親プロファイルの確認
SELECT id, user_id, display_name, role
FROM profiles
WHERE role = 'parent'
ORDER BY created_at DESC;

-- 作品データを確認
SELECT id, user_id, profile_id, title, type, created_at
FROM works
ORDER BY created_at DESC
LIMIT 20;

-- プロファイルデータを確認
SELECT id, user_id, role, username, display_name, parent_id
FROM profiles
WHERE role = 'child'
ORDER BY username;

-- 作品とプロファイルの関連を確認
SELECT w.id, w.title, w.user_id, w.profile_id, 
       p.id as profile_id, p.username, p.role, p.user_id as profile_user_id
FROM works w
LEFT JOIN profiles p ON w.profile_id = p.id
ORDER BY w.created_at DESC
LIMIT 20; 