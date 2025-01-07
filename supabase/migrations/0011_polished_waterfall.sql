/*
  # Add AI Analysis Index

  1. New Index
    - Add index on ai_analysis field for better query performance
    - Index is partial to only include rows that have AI analysis
*/

-- Add index for AI analysis queries
CREATE INDEX IF NOT EXISTS idx_question_answers_ai_analysis 
ON question_answers ((answer->>'aiAnalysis'))
WHERE answer->>'aiAnalysis' IS NOT NULL;