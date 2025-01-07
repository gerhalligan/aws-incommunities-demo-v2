/*
  # Create question_answers table

  1. Table Creation
    - Creates question_answers table for storing user responses
    - Includes JSON validation for answer structure
    - Links to auth.users and questions tables
  
  2. Security
    - Enables RLS
    - Adds policies for access control
*/

-- Create question_answers table
CREATE TABLE public.question_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id integer NOT NULL,
  answer jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT question_answers_pkey PRIMARY KEY (id),
  CONSTRAINT question_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT answer_schema_check CHECK (
    jsonb_typeof(answer) = 'object' AND
    (
      (answer ->> 'value' IS NOT NULL) OR
      (
        (answer ->> 'type' = 'file-upload') AND
        jsonb_typeof(answer -> 'value') = 'string'
      )
    ) AND
    (
      (answer ->> 'optionId' IS NULL) OR
      jsonb_typeof(answer -> 'optionId') = 'string'
    ) AND
    (
      (answer ->> 'aiAnalysis' IS NULL) OR
      jsonb_typeof(answer -> 'aiAnalysis') = 'string'
    ) AND
    (
      (answer ->> 'type' IS NULL) OR
      jsonb_typeof(answer -> 'type') = 'string'
    )
  )
);

-- Enable RLS
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own answers"
  ON question_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON question_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON question_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE question_answers TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_question_answers_user_id ON question_answers(user_id);
CREATE INDEX idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX idx_question_answers_created_at ON question_answers(created_at);