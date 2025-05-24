-- 1. ストレージバケットの設定を確認
SELECT 
  id,
  name,
  public,
  created_at,
  updated_at
FROM storage.buckets 
WHERE name = 'works';

-- 2. ストレージオブジェクトのポリシーを確認
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
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- 3. 実際のストレージオブジェクトを確認（最新5件）
SELECT 
  id,
  name,
  bucket_id,
  owner,
  created_at,
  last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'works'
ORDER BY created_at DESC
LIMIT 5;

-- 4. 特定の作品のストレージオブジェクトを確認（らいおん、くじら、たいよう）
SELECT 
  w.id as work_id,
  w.title,
  w.content_url,
  w.type,
  so.id as storage_object_id,
  so.name as storage_name,
  so.bucket_id,
  so.owner,
  so.metadata
FROM works w
LEFT JOIN storage.objects so ON so.name = REPLACE(w.content_url, 'https://gjerysvernlrqtsfumts.supabase.co/storage/v1/object/public/works/', '')
WHERE w.title IN ('らいおん', 'くじら', 'たいよう')
ORDER BY w.created_at DESC; 