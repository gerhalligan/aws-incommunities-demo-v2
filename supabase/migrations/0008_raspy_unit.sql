/*
  # Update question type constraint
  
  1. Changes
    - Add 'repeater' as valid question type
    - Update existing type check constraint
*/

-- Drop existing type check constraint if it exists
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;

-- Add new type check constraint with 'repeater' type
ALTER TABLE questions 
ADD CONSTRAINT questions_type_check 
CHECK (type IN ('multiple-choice', 'input', 'repeater'));