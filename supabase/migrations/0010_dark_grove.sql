/*
  # Add AI Analysis Support

  1. Changes
    - Add JSON schema validation for AI analysis in answers
    - Ensure answer column can store AI analysis data
*/

-- Add JSON schema validation for the answer column
ALTER TABLE question_answers
DROP CONSTRAINT IF EXISTS answer_schema_check;

ALTER TABLE question_answers
ADD CONSTRAINT answer_schema_check CHECK (
  jsonb_typeof(answer) = 'object' AND
  (
    -- Value is required
    answer->>'value' IS NOT NULL
  ) AND
  (
    -- optionId is optional but must be string if present
    answer->>'optionId' IS NULL OR
    jsonb_typeof(answer->'optionId') = 'string'
  ) AND
  (
    -- aiAnalysis is optional but must be string if present
    answer->>'aiAnalysis' IS NULL OR
    jsonb_typeof(answer->'aiAnalysis') = 'string'
  )
);