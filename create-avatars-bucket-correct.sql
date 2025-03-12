-- avatarsバケットを作成（既に存在する場合は何もしない）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "avatars_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;

-- アップロードポリシー（認証済みユーザーがavatarsバケットにアップロード可能）
CREATE POLICY "avatars_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 閲覧ポリシー（誰でもavatarsバケットの内容を閲覧可能）
CREATE POLICY "avatars_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 更新ポリシー（認証済みユーザーがavatarsバケットの内容を更新可能）
CREATE POLICY "avatars_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 削除ポリシー（認証済みユーザーがavatarsバケットの内容を削除可能）
CREATE POLICY "avatars_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars'); 