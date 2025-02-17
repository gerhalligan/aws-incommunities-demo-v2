-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-files', 'question-files', false);

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading files
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for reading own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'question-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for deleting own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);