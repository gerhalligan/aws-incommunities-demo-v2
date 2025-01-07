/*
  # Create question dependencies table

  1. Table Creation
    - Creates question_dependencies table for managing question dependencies
    - Includes foreign key constraints to questions table
    - Adds unique constraint on question pairs
  
  2. Security
    - Enables RLS
    - Adds policies for access control
*/

-- Create question_dependencies table
CREATE TABLE public.question_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id bigint NULL,
  dependent_question_id bigint NULL,
  dependent_options text[] NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT question_dependencies_pkey PRIMARY KEY (id),
  CONSTRAINT question_dependencies_question_id_dependent_question_id_key 
    UNIQUE (question_id, dependent_question_id),
  CONSTRAINT question_dependencies_dependent_question_id_fkey 
    FOREIGN KEY (dependent_question_id) 
    REFERENCES questions(id) 
    ON DELETE CASCADE,
  CONSTRAINT question_dependencies_question_id_fkey 
    FOREIGN KEY (question_id) 
    REFERENCES questions(id) 
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE question_dependencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read dependencies"
  ON question_dependencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify dependencies"
  ON question_dependencies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON TABLE question_dependencies TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_question_dependencies_question_id 
  ON question_dependencies(question_id);
CREATE INDEX idx_question_dependencies_dependent_question_id 
  ON question_dependencies(dependent_question_id);