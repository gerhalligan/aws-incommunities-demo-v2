/*
  # Add partial unique index for main questions

  1. Changes
    - Adds a partial unique index for main questions (no branch context)
    - Ensures only one answer per user per question when not in a branch
    - Improves query performance for non-branched questions
*/

-- Add a partial unique index for main questions (no branch context)
CREATE UNIQUE INDEX question_answers_unique_main
ON public.question_answers (user_id, question_id)
WHERE parent_repeater_id IS NULL AND branch_entry_id IS NULL;

-- Add comment explaining the index
COMMENT ON INDEX question_answers_unique_main IS 
'Ensures unique answers per user per question when not in a branch context';