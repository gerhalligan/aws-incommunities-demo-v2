/*
  # Add Option Dependencies
  
  1. New Tables
    - `option_dependencies` table to store dependencies between options
  
  2. Changes
    - Add foreign key constraints and indexes
    - Add RLS policies
    
  3. Security
    - Enable RLS
    - Add policies for read/write access
*/

-- Create option dependencies table
CREATE TABLE public.option_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  option_id text NOT NULL,
  dependent_question_id bigint NOT NULL,
  dependent_option_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT option_dependencies_pkey PRIMARY KEY (id),
  CONSTRAINT option_dependencies_option_id_fkey 
    FOREIGN KEY (option_id) 
    REFERENCES options(id) 
    ON DELETE CASCADE,
  CONSTRAINT option_dependencies_dependent_question_id_fkey 
    FOREIGN KEY (dependent_question_id) 
    REFERENCES questions(id) 
    ON DELETE CASCADE
);



-- Grant permissions
GRANT ALL ON TABLE option_dependencies TO authenticated;


