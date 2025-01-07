/*
  # Add Options Column to Questions Table
  
  1. Changes
    - Add options column to questions table
    - Add check constraint to ensure valid JSON array
*/

-- Add options column
ALTER TABLE questions
ADD COLUMN options jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add check constraint to ensure options is a JSON array
ALTER TABLE questions
ADD CONSTRAINT questions_options_check CHECK (
  jsonb_typeof(options) = 'array'
);

-- Create policy for reading questions
CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for updating questions (admin only)
CREATE POLICY "Only admins can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for inserting questions (admin only)  
CREATE POLICY "Only admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy for deleting questions (admin only)
CREATE POLICY "Only admins can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );