/*
  # Create storage bucket for works if not exists

  1. Storage Bucket
    - Check if 'works' bucket exists before creating
    - Set up RLS policies for secure access

  2. Security Policies
    - Upload: Only authenticated users can upload to their own folder
    - Read: Public access for viewing files
    - Update/Delete: Users can only modify their own files
*/

-- Create a new storage bucket for works if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'works'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('works', 'works', true);
  END IF;
END $$;

-- Set up RLS policies for the works bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload files'
  ) THEN
    CREATE POLICY "Authenticated users can upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view files'
  ) THEN
    CREATE POLICY "Anyone can view files"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'works');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own files'
  ) THEN
    CREATE POLICY "Users can update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own files'
  ) THEN
    CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;