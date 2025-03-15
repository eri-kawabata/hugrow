-- 作品を子供プロファイル間で分散させるためのSQLスクリプト

-- 現在の作品分布を確認
SELECT p.id AS profile_id, p.username, COUNT(w.id) AS work_count
FROM profiles p
LEFT JOIN works w ON p.id = w.profile_id
WHERE p.role = 'child'
GROUP BY p.id, p.username
ORDER BY work_count DESC;

-- 特定の作品を特定の子供プロファイルに割り当てる
-- 例: GINTOKIという作品をGintokiプロファイルに割り当てる
UPDATE works
SET profile_id = '3b080850-7314-4efa-8aab-15d9525bc806'  -- Gintokiのプロファイルid
WHERE title = 'GINTOKI';

-- 「ぎん」という作品をGintokiプロファイルに割り当てる
UPDATE works
SET profile_id = '3b080850-7314-4efa-8aab-15d9525bc806'  -- Gintokiのプロファイルid
WHERE title = 'ぎん';

-- 「ぎんとき」という作品をGintokiプロファイルに割り当てる
UPDATE works
SET profile_id = '3b080850-7314-4efa-8aab-15d9525bc806'  -- Gintokiのプロファイルid
WHERE title = 'ぎんとき';

-- 「ふく」という作品をFukuプロファイルに割り当てる
UPDATE works
SET profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'  -- Fukuのプロファイルid
WHERE title = 'ふく';

-- 「はーと」と「はーと２」という作品をFukuプロファイルに割り当てる
UPDATE works
SET profile_id = '0eec8565-578a-4039-af0f-74831b4c3d5a'  -- Fukuのプロファイルid
WHERE title IN ('はーと', 'はーと２', 'はーとK', 'ほし');

-- 「きんた」という作品をKintaプロファイルに割り当てる
UPDATE works
SET profile_id = 'ac6a6bcd-1271-4de0-aea3-cf897d54ee01'  -- Kintaのプロファイルid
WHERE title = 'きんた';

-- 更新後の作品分布を確認
SELECT p.id AS profile_id, p.username, COUNT(w.id) AS work_count
FROM profiles p
LEFT JOIN works w ON p.id = w.profile_id
WHERE p.role = 'child'
GROUP BY p.id, p.username
ORDER BY work_count DESC;

-- 各子供プロファイルの作品一覧を確認
SELECT p.username AS child_name, w.title, w.type, w.created_at
FROM profiles p
JOIN works w ON p.id = w.profile_id
WHERE p.role = 'child'
ORDER BY p.username, w.created_at DESC; 