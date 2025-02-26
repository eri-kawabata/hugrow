/*
  # Create storage bucket for works

  1. New Storage Bucket
    - `works` bucket for storing user-generated content
      - Images
      - Videos
      - Audio files

  2. Security
    - Enable RLS policies for the bucket
    - Add policies for authenticated users to:
      - Upload their own files
      - Read all files
      - Update their own files
      - Delete their own files
*/

-- Create a new storage bucket for works
INSERT INTO storage.buckets (id, name, public)
VALUES ('works', 'works', true);

-- Set up RLS policies for the works bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'works');

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]);