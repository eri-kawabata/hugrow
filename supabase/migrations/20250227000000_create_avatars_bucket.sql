/*
  # Create storage bucket for avatars

  1. Storage Bucket
    - Create 'avatars' bucket for storing user profile images
    - Set up RLS policies for secure access
    - Enable public access for avatar images
*/

-- Create a new storage bucket for avatars if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('avatars', 'avatars', true);
  END IF;
END $$;

-- Set up RLS policies for the avatars bucket
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (
  -- Extract user ID from filename pattern (user_id-random.ext)
  SPLIT_PART(name, '-', 1) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
));

-- Allow public access to all avatars
CREATE POLICY "Public can view all avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (
  SPLIT_PART(name, '-', 1) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
));

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (
  SPLIT_PART(name, '-', 1) IN (
    SELECT id::text FROM profiles WHERE user_id = auth.uid()
  )
)); 