-- 1. 修正後のmimetypeを再確認
SELECT 
  name,
  metadata->>'mimetype' as mimetype,
  metadata->>'size' as size,
  metadata->>'eTag' as etag,
  owner
FROM storage.objects 
WHERE bucket_id = 'works'
  AND name IN (
    '66b52e77-29b1-49b3-9ff9-a5e94ae9ecb5/photo_1748067270959_dcgshr.jpg',
    '66b52e77-29b1-49b3-9ff9-a5e94ae9ecb5/photo_1748066981088_0jfxy.jpg',
    '66b52e77-29b1-49b3-9ff9-a5e94ae9ecb5/photo_1748066660303_en6gjo.jpg'
  )
ORDER BY name;

-- 2. ファイルの最初の数バイトを確認（ファイル形式を判定）
-- 注意: この機能がSupabaseで利用可能かは環境によります
SELECT 
  name,
  metadata->>'mimetype' as mimetype,
  CASE 
    WHEN metadata->>'mimetype' = 'image/jpeg' THEN '正常なJPEG mimetype'
    WHEN metadata->>'mimetype' = 'application/json' THEN '⚠️ まだJSON mimetype'
    ELSE '⚠️ その他: ' || (metadata->>'mimetype')
  END as status
FROM storage.objects 
WHERE bucket_id = 'works'
  AND name LIKE '%photo_%'
ORDER BY created_at DESC
LIMIT 10; 