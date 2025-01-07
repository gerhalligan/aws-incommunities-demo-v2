/*
  # Update Question Answers Unique Constraint

  1. Changes
    - Drop existing unique constraint on user_id and question_id
    - Add new composite unique constraint including branch columns
    - This allows multiple answers for the same question in different branches

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions required
*/

-- Drop existing unique constraint if it exists
ALTER TABLE question_answers 
DROP CONSTRAINT IF EXISTS question_answers_user_id_question_id_key;

-- Add new composite unique constraint that includes branch columns
ALTER TABLE question_answers
ADD CONSTRAINT question_answers_unique_answer 
UNIQUE (user_id, question_id, COALESCE(parent_repeater_id, 0), COALESCE(branch_entry_id, ''));

-- Add index to support the new constraint
CREATE INDEX idx_question_answers_unique_lookup
ON question_answers(user_id, question_id, parent_repeater_id, branch_entry_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT question_answers_unique_answer ON question_answers IS 
'Ensures unique answers per user per question per branch context';