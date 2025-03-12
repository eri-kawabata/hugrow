-- avatarsバケットが存在しない場合に作成する
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true);
  END IF;
END $$;

-- 既存のポリシーを削除（エラーを避けるため）
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- RLSポリシーを設定
-- ユーザーが自分のアバターをアップロードできるようにする
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (
  -- ファイル名のパターン（user_id-random.ext）からユーザーIDを抽出
  SPLIT_PART(name, '-', 1) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
));

-- すべてのアバターを公開アクセス可能にする
CREATE POLICY "Public can view all avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ユーザーが自分のアバターを更新できるようにする
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (
  SPLIT_PART(name, '-', 1) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
));

-- ユーザーが自分のアバターを削除できるようにする
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (
  SPLIT_PART(name, '-', 1) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
)); 