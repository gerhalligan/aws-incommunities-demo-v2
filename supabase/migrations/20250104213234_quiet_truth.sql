-- Add question_order column
ALTER TABLE questions 
ADD COLUMN question_order SERIAL;

-- Initialize question_order based on existing IDs
UPDATE questions 
SET question_order = id;

-- Create index for performance
CREATE INDEX idx_questions_order ON questions(question_order);

-- Add constraint to ensure question_order is unique
ALTER TABLE questions
ADD CONSTRAINT questions_order_unique UNIQUE (question_order);

-- Create function to handle reordering
CREATE OR REPLACE FUNCTION update_question_order(
  question_id bigint,
  new_order integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_order integer;
BEGIN
  -- Get current order
  SELECT question_order INTO old_order
  FROM questions
  WHERE id = question_id;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Update orders
  IF new_order > old_order THEN
    -- Moving down: decrease order of questions in between
    UPDATE questions
    SET question_order = question_order - 1
    WHERE question_order <= new_order
    AND question_order > old_order;
  ELSE
    -- Moving up: increase order of questions in between
    UPDATE questions
    SET question_order = question_order + 1
    WHERE question_order >= new_order
    AND question_order < old_order;
  END IF;

  -- Set new order for target question
  UPDATE questions
  SET question_order = new_order
  WHERE id = question_id;
END;
$$;