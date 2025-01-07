/*
  # Insert Default Questions
  
  1. Changes
    - Insert initial set of questions into questions table
    
  2. Data
    - 9 default questions with their configurations
    - Multiple choice options
    - File upload metadata
    - Default next question relationships
*/

INSERT INTO questions (
  id,
  question,
  type,
  options,
  default_next_question_id,
  file_upload_metadata,
  created_at,
  updated_at
) VALUES
  (1, 'Region', 'multiple-choice', 
   '[{"id": "1a", "text": "AMER"}, {"id": "1b", "text": "APJC (CPT & MENA?)"}, {"id": "1c", "text": "EMEA (EURI?)"}]',
   2,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  ),
  (2, 'Cluster name', 'multiple-choice',
   '[{"id": "2a", "text": "Official designated site code - or project name"}, {"id": "2b", "text": "See Column AB"}]',
   3,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
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
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  ),
  (4, 'Tier level for 2025', 'multiple-choice',
   '[
     {"id": "4a", "text": "Tier 1 - (Critical impact on Business continuity, expansion and cost savings)"},
     {"id": "4b", "text": "Tier 2 - (Significant impact on DCC priorities, including business continuity and expansion)"},
     {"id": "4c", "text": "Tier 3 - (May not lead to adverse business impact or a significant direct benefit)"},
     {"id": "4d", "text": "Not yet designated"}
   ]',
   5,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  ),
  (5, 'Number of AZ(s) and their names', 'multiple-choice',
   '[{"id": "5a", "text": "Specific address per AZ"}]',
   6,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  ),
  (6, 'AZ ZIP Code', 'multiple-choice',
   '[{"id": "6a", "text": "Per area of interest"}]',
   7,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
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
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  ),
  (8, 'Relevant municipalities to each AZ', 'multiple-choice',
   '[{"id": "8a", "text": "Town/ Township/ County etc"}]',
   9,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  ),
  (9, 'AHJ for each AZ', 'multiple-choice',
   '[{"id": "9a", "text": "Permit Granting authority"}]',
   null,
   '{"enabled": false, "required": false, "maxFiles": 1, "fileLabels": ["Upload File"], "fileRequirements": [false]}',
   now(),
   now()
  );