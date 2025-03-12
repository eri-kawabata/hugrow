-- 1. ストレージバケットの確認
SELECT id, name, public, owner, created_at
FROM storage.buckets
ORDER BY created_at DESC;

-- 2. ストレージポリシーの確認（修正版）
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 3. プロフィールテーブルの構造確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. プロフィールテーブルのインデックス確認（シンプル版）
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 5. avatarsバケットに関連するストレージオブジェクトの数を確認
SELECT COUNT(*) AS object_count
FROM storage.objects
WHERE bucket_id = 'avatars';

-- 6. プロフィールテーブルでavatar_urlが設定されているレコード数を確認
SELECT COUNT(*) AS profiles_with_avatar
FROM profiles
WHERE avatar_url IS NOT NULL;

-- 7. ストレージの使用状況を確認（エラー回避のため修正）
SELECT
    bucket_id,
    COUNT(*) AS object_count
FROM storage.objects
GROUP BY bucket_id
ORDER BY COUNT(*) DESC; 