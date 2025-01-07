/*
  # Fix Storage RLS Policies

  1. Changes
    - Drop existing storage policies
    - Create new comprehensive RLS policies for file uploads
    - Add proper path validation using split_part
  
  2. Security
    - Ensure users can only access their own files
    - Validate file paths match user ID pattern
    - Add proper bucket policies
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create new upload policy with path validation
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-files' AND
  split_part(name, '/', 1) = auth.uid()::text AND
  split_part(name, '/', 2) IS NOT NULL AND
  split_part(name, '/', 3) IS NOT NULL AND
  split_part(name, '/', 4) IS NULL
);

-- Create new read policy
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'question-files' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- Create new delete policy
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-files' AND
  split_part(name, '/', 1) = auth.uid()::text
);

-- Update bucket configuration
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
WHERE id = 'question-files';