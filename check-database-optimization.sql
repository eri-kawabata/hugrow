-- 1. ストレージバケットの確認
SELECT id, name, public, owner, created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- 2. ストレージポリシーの確認
SELECT p.policyname, p.tablename, p.operation, p.definition, p.roles
FROM pg_policies p
WHERE p.schemaname = 'storage' AND p.tablename = 'objects'
ORDER BY p.policyname;

-- 3. プロフィールテーブルの構造確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. プロフィールテーブルのインデックス確認
SELECT
    i.relname AS index_name,
    a.attname AS column_name,
    ix.indisunique AS is_unique
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'profiles'
ORDER BY
    i.relname,
    a.attnum;

-- 5. avatarsバケットに関連するストレージオブジェクトの数を確認
SELECT COUNT(*) AS object_count
FROM storage.objects
WHERE bucket_id = 'avatars';

-- 6. プロフィールテーブルでavatar_urlが設定されているレコード数を確認
SELECT COUNT(*) AS profiles_with_avatar
FROM profiles
WHERE avatar_url IS NOT NULL;

-- 7. ストレージの使用状況を確認
SELECT
    bucket_id,
    COUNT(*) AS object_count,
    SUM(metadata->>'size')::bigint AS total_size_bytes,
    (SUM(metadata->>'size')::bigint / 1024 / 1024) AS total_size_mb
FROM storage.objects
GROUP BY bucket_id
ORDER BY total_size_bytes DESC; 