-- Add dependsOn column to questions table
ALTER TABLE questions
ADD COLUMN depends_on jsonb;

-- Add index for performance
CREATE INDEX idx_questions_depends_on ON questions USING gin (depends_on);

-- Add comment explaining the column
COMMENT ON COLUMN questions.depends_on IS 'Array of dependency objects with questionId and options array';