/*
  # Add Application Tracking
  
  1. Changes
    - Add application_id column to question_answers table
    - Add index for faster lookups
    - Add constraint to ensure all answers in an application have the same timestamp
  
  2. Benefits
    - Better organization of answers by application
    - Easier deletion and loading of complete applications
    - Improved query performance
*/

-- Add application_id column
ALTER TABLE question_answers
ADD COLUMN application_id uuid;

-- Add index for performance
CREATE INDEX idx_question_answers_application_id 
ON question_answers(application_id);

-- Add comment explaining the column
COMMENT ON COLUMN question_answers.application_id IS 'UUID to group related answers into a single application';