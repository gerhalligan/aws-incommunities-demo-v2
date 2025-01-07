/*
  # Test Open Storage Policy
  
  1. Changes
    - Drop existing restrictive policies
    - Create single open policy for authenticated users
    - Keep bucket configuration
  
  2. Security
    - Only authenticated users can access (still requires login)
    - No path validation for testing
    - Temporary policy for debugging
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create a single open policy for all operations
CREATE POLICY "Authenticated users full access"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'question-files')
WITH CHECK (bucket_id = 'question-files');

-- Keep bucket configuration
UPDATE storage.buckets
SET public = false,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
WHERE id = 'question-files';