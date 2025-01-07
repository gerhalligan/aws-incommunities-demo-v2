/*
  # Create options table

  1. Table Creation
    - Creates options table for storing question options
    - Includes foreign key references to questions
    - Adds timestamps for tracking
  
  2. Security
    - Enables RLS
    - Adds policies for access control
*/

-- Create options table
CREATE TABLE public.options (
  id text NOT NULL,
  question_id bigint NULL,
  text text NOT NULL,
  next_question_id bigint NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  CONSTRAINT options_pkey PRIMARY KEY (id)
);

-- Add foreign key constraints
ALTER TABLE public.options
ADD CONSTRAINT options_question_id_fkey
FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE public.options
ADD CONSTRAINT options_next_question_id_fkey
FOREIGN KEY (next_question_id) REFERENCES questions(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read options"
  ON options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify options"
  ON options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON TABLE public.options TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_options_next_question_id ON options(next_question_id);