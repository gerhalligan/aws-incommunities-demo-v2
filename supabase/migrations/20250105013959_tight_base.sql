/*
  # Add Branch Columns to Question Answers

  1. Changes
    - Add parent_repeater_id column to link to parent repeater question
    - Add branch_entry_id column to identify specific repeater entry
    - Add branch_entry_index column for display order
    - Add index for efficient querying
    - Add comments for documentation

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions required
*/

-- Add branch-related columns
ALTER TABLE question_answers
ADD COLUMN parent_repeater_id integer REFERENCES questions(id),
ADD COLUMN branch_entry_id text,
ADD COLUMN branch_entry_index integer;

-- Add index for better query performance
CREATE INDEX idx_question_answers_branch 
ON question_answers(parent_repeater_id, branch_entry_id);

-- Add comments explaining columns
COMMENT ON COLUMN question_answers.parent_repeater_id IS 'ID of the parent repeater question';
COMMENT ON COLUMN question_answers.branch_entry_id IS 'ID of the specific entry in the repeater';
COMMENT ON COLUMN question_answers.branch_entry_index IS 'Index of the entry in the repeater (1-based)';

-- Add constraint to ensure branch_entry_id is set when parent_repeater_id is set
ALTER TABLE question_answers
ADD CONSTRAINT branch_entry_consistency 
CHECK (
  (parent_repeater_id IS NULL AND branch_entry_id IS NULL) OR
  (parent_repeater_id IS NOT NULL AND branch_entry_id IS NOT NULL)
);