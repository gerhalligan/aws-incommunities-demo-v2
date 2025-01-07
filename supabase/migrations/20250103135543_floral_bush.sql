/*
  # Create questions table

  1. Table Creation
    - Creates questions table for storing quiz questions
    - Includes JSON validation for various metadata fields
    - Supports multiple question types
  
  2. Security
    - Enables RLS
    - Adds policies for access control
*/

-- Create questions table
CREATE TABLE public.questions (
  id bigint NOT NULL,
  question text NOT NULL,
  type text NOT NULL,
  default_next_question_id bigint NULL,
  input_metadata jsonb NULL,
  file_upload_metadata jsonb NULL,
  ai_lookup jsonb NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  repeater_config jsonb NULL,
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_default_next_question_id_fkey 
    FOREIGN KEY (default_next_question_id) 
    REFERENCES questions(id),
  CONSTRAINT questions_options_check 
    CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT questions_repeater_config_check CHECK (
    jsonb_typeof(repeater_config) IS NULL OR
    (
      jsonb_typeof(repeater_config) = 'object' AND
      jsonb_typeof(repeater_config -> 'fields') = 'array' AND
      (
        (repeater_config ->> 'minEntries' IS NULL) OR
        jsonb_typeof(repeater_config -> 'minEntries') = 'number'
      ) AND
      (
        (repeater_config ->> 'maxEntries' IS NULL) OR
        jsonb_typeof(repeater_config -> 'maxEntries') = 'number'
      )
    )
  ),
  CONSTRAINT questions_type_check CHECK (
    type IN ('multiple-choice', 'input', 'repeater')
  )
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON TABLE questions TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_default_next_question_id ON questions(default_next_question_id);