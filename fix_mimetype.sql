-- ストレージオブジェクトのmimetypeを修正するスクリプト

-- 1. JPEGファイルのmimetypeを修正
UPDATE storage.objects 
SET metadata = jsonb_set(metadata, '{mimetype}', '"image/jpeg"')
WHERE bucket_id = 'works' 
  AND name LIKE '%.jpg' 
  AND metadata->>'mimetype' = 'application/json';

-- 2. PNGファイルのmimetypeを修正
UPDATE storage.objects 
SET metadata = jsonb_set(metadata, '{mimetype}', '"image/png"')
WHERE bucket_id = 'works' 
  AND name LIKE '%.png' 
  AND metadata->>'mimetype' = 'application/json';

-- 3. 修正結果を確認
SELECT 
  name,
  metadata->>'mimetype' as mimetype,
  metadata->>'size' as size
FROM storage.objects 
WHERE bucket_id = 'works'
  AND name IN (
    '66b52e77-29b1-49b3-9ff9-a5e94ae9ecb5/photo_1748067270959_dcgshr.jpg',
    '66b52e77-29b1-49b3-9ff9-a5e94ae9ecb5/photo_1748066981088_0jfxy.jpg',
    '66b52e77-29b1-49b3-9ff9-a5e94ae9ecb5/photo_1748066660303_en6gjo.jpg'
  )
ORDER BY name; 