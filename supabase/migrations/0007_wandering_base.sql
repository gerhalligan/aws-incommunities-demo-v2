/*
  # Add Question Answers Table

  1. New Tables
    - `question_answers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question_id` (int, references questions)
      - `answer` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create question_answers table
CREATE TABLE question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  question_id int NOT NULL,
  answer jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own answers"
  ON question_answers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON question_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON question_answers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_question_answers_updated_at
  BEFORE UPDATE ON question_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();