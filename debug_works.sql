-- らいおん、くじら、たいようの作品データを詳細確認
SELECT 
  id,
  title,
  content_url,
  type,
  created_at,
  user_id,
  LENGTH(content_url) as url_length,
  CASE 
    WHEN content_url LIKE 'https://gjerysvernlrqtsfumts.supabase.co%' THEN 'Supabase URL'
    WHEN content_url LIKE 'http%' THEN 'Other HTTP URL'
    ELSE 'Relative path'
  END as url_type
FROM works 
WHERE title IN ('らいおん', 'くじら', 'たいよう')
ORDER BY created_at DESC; 