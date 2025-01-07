/*
  # Fix Storage Policies

  1. Changes
    - Drop existing policies
    - Create simplified but secure policies
    - Remove problematic path validation functions
  
  2. Security
    - Maintain user isolation
    - Basic path validation
    - Keep file type and size limits
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users full access" ON storage.objects;

-- Create simplified upload policy
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-files' AND
  position(auth.uid()::text in name) = 1
);

-- Create simplified read policy
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'question-files' AND
  position(auth.uid()::text in name) = 1
);

-- Create simplified delete policy
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-files' AND
  position(auth.uid()::text in name) = 1
);

-- Keep bucket configuration
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
WHERE id = 'question-files';