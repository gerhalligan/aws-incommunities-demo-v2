-- Drop existing function
DROP FUNCTION IF EXISTS delete_question(bigint);

-- Create improved delete_question function
CREATE OR REPLACE FUNCTION delete_question(question_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_order integer;
BEGIN
  -- Get the current order of the question to be deleted
  SELECT question_order INTO current_order
  FROM questions
  WHERE id = question_id;

  IF current_order IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Delete the question
  DELETE FROM questions WHERE id = question_id;

  -- Update orders for remaining questions
  -- Temporarily set orders to a negative value to avoid conflicts
  UPDATE questions
  SET question_order = -question_order
  WHERE question_order > current_order;

  UPDATE questions
  SET question_order = -question_order - 1
  WHERE question_order < 0;

  -- Reset the sequence to match the highest order
  PERFORM setval(
    pg_get_serial_sequence('questions', 'question_order'),
    COALESCE((SELECT MAX(question_order) FROM questions), 0),
    true
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_question TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_question IS 'Deletes a question and reorders remaining questions while maintaining sequence.';