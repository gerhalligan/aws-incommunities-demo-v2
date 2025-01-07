/*
  # Create default questions table and data

  1. New Tables
    - `default_questions` - Stores the default set of questions
      - `id` (int, primary key)
      - `question` (text)
      - `type` (text)
      - `options` (jsonb)
      - `default_next_question_id` (int)
      - `file_upload_metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `default_questions` table
    - Add policy for authenticated users to read default questions
*/

-- Create default_questions table
CREATE TABLE IF NOT EXISTS default_questions (
  id int PRIMARY KEY,
  question text NOT NULL,
  type text NOT NULL,
  options jsonb NOT NULL,
  default_next_question_id int,
  file_upload_metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE default_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for reading default questions
CREATE POLICY "Anyone can read default questions"
  ON default_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default questions
INSERT INTO default_questions (id, question, type, options, default_next_question_id, file_upload_metadata)
VALUES
  (1, 'Region', 'multiple-choice', 
   '[{"id": "1a", "text": "AMER"}, {"id": "1b", "text": "APJC (CPT & MENA?)"}, {"id": "1c", "text": "EMEA (EURI?)"}]',
   2,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (2, 'Cluster name', 'multiple-choice',
   '[{"id": "2a", "text": "Official designated site code - or project name"}, {"id": "2b", "text": "See Column AB"}]',
   3,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (3, 'Infrastructure Type', 'multiple-choice',
   '[
     {"id": "3a", "text": "Existing region"},
     {"id": "3b", "text": "Existing region - expansion"},
     {"id": "3c", "text": "New region - regular campus"},
     {"id": "3d", "text": "New region - mega campus"},
     {"id": "3e", "text": "Real Estate prospect in DD"},
     {"id": "3f", "text": "Subsea cable"},
     {"id": "3g", "text": "Windfarm"},
     {"id": "3h", "text": "Solar farm"},
     {"id": "3i", "text": "Other infrastructure (ADC etc)"},
     {"id": "3j", "text": "Adhoc request"}
   ]',
   4,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (4, 'Tier level for 2025', 'multiple-choice',
   '[
     {"id": "4a", "text": "Tier 1 - (Critical impact on Business continuity, expansion and cost savings)"},
     {"id": "4b", "text": "Tier 2 - (Significant impact on DCC priorities, including business continuity and expansion)"},
     {"id": "4c", "text": "Tier 3 - (May not lead to adverse business impact or a significant direct benefit)"},
     {"id": "4d", "text": "Not yet designated"}
   ]',
   5,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (5, 'Number of AZ(s) and their names', 'multiple-choice',
   '[{"id": "5a", "text": "Specific address per AZ"}]',
   6,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (6, 'AZ ZIP Code', 'multiple-choice',
   '[{"id": "6a", "text": "Per area of interest"}]',
   7,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (7, 'Location type for each AZ', 'multiple-choice',
   '[
     {"id": "7a", "text": "Urban"},
     {"id": "7b", "text": "Industrial"},
     {"id": "7c", "text": "Suburban"},
     {"id": "7d", "text": "Rural"},
     {"id": "7e", "text": "Small town"}
   ]',
   8,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (8, 'Relevant municipalities to each AZ', 'multiple-choice',
   '[{"id": "8a", "text": "Town/ Township/ County etc"}]',
   9,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  ),
  (9, 'AHJ for each AZ', 'multiple-choice',
   '[{"id": "9a", "text": "Permit Granting authority"}]',
   null,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}'
  );