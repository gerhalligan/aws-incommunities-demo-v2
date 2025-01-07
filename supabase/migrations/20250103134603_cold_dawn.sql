/*
  # Create storage bucket for file uploads

  1. New Storage Bucket
    - Creates 'question-files' bucket
    - Sets up security and file restrictions
  
  2. Security
    - Enables RLS
    - Creates policies for file access
    - Sets up proper permissions
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-files',
  'question-files',
  false,
  52428800, -- 50MB limit
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for file access
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'question-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant bucket access to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;