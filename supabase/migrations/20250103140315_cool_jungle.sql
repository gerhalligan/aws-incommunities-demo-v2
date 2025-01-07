/*
  # Insert initial questions

  1. Data Creation
    - Inserts base questions for AWS InCommunities questionnaire
    - Includes configuration for multiple choice, input, and repeater questions
    - Sets up file upload metadata and AI analysis settings
  
  2. Question Types
    - Multiple choice questions with predefined options
    - Input questions with validation
    - Repeater questions with field configurations
*/

-- Insert questions
INSERT INTO questions (
  id, 
  question,
  type,
  default_next_question_id,
  input_metadata,
  file_upload_metadata,
  ai_lookup,
  options,
  repeater_config
) VALUES
  (1, 'Region', 'multiple-choice', 2, NULL, 
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '1a', 'text', 'AMER'),
      jsonb_build_object('id', '1b', 'text', 'APJC (CPT & MENA?)'),
      jsonb_build_object('id', '1c', 'text', 'EMEA (EURI?)')
    ),
    NULL
  ),
  
  (2, 'Cluster name', 'input', 3, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '2a', 'text', 'Official designated site code - or project name'),
      jsonb_build_object('id', '2b', 'text', 'See Column AB')
    ),
    NULL
  ),
  
  (3, 'Infrastructure Type', 'multiple-choice', 4, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '3a', 'text', 'Existing region'),
      jsonb_build_object('id', '3b', 'text', 'Existing region - expansion'),
      jsonb_build_object('id', '3c', 'text', 'New region - regular campus'),
      jsonb_build_object('id', '3d', 'text', 'New region - mega campus'),
      jsonb_build_object('id', '3e', 'text', 'Real Estate prospect in DD'),
      jsonb_build_object('id', '3f', 'text', 'Subsea cable'),
      jsonb_build_object('id', '3g', 'text', 'Windfarm'),
      jsonb_build_object('id', '3h', 'text', 'Solar farm'),
      jsonb_build_object('id', '3i', 'text', 'Other infrastructure (ADC etc)'),
      jsonb_build_object('id', '3j', 'text', 'Adhoc request')
    ),
    NULL
  ),
  
  (4, 'Tier level for 2025', 'multiple-choice', 5, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '4a', 'text', 'Tier 1 - (Critical impact on Business continuity, expansion and cost savings)'),
      jsonb_build_object('id', '4b', 'text', 'Tier 2 - (Significant impact on DCC priorities, including business continuity and expansion)'),
      jsonb_build_object('id', '4c', 'text', 'Tier 3 - (May not lead to adverse business impact or a significant direct benefit)'),
      jsonb_build_object('id', '4d', 'text', 'Not yet designated')
    ),
    NULL
  ),
  
  (5, 'Number of AZ(s) and their names', 'repeater', 6, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '5a', 'text', 'Specific address per AZ')
    ),
    jsonb_build_object(
      'fields', jsonb_build_array(
        jsonb_build_object(
          'id', '509caa00-441a-4d49-abc7-d3dad5480100',
          'type', 'text',
          'label', 'Names',
          'required', false
        ),
        jsonb_build_object(
          'id', '58651afb-89e8-4954-ba8f-e5d7f2029866',
          'type', 'textarea',
          'label', 'Description',
          'required', false
        )
      ),
      'maxEntries', 5,
      'minEntries', 1
    )
  ),
  
  (6, 'Alternative Zone (AZ) ZIP Code', 'input', 7, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    jsonb_build_object(
      'enabled', true,
      'prompt', 'Based on the answer ''{{answer}}'' to the question ''{{question}}'', provide a detailed analysis of the are. Use information from the most recent local census. Base your answer around information that would be useful for AWS InCommunities, with location areas to build or expand data centers. List the pros and cons for this area as it relates to AWS InCommunities.'
    ),
    jsonb_build_array(
      jsonb_build_object('id', '6a', 'text', 'Per area of interest')
    ),
    NULL
  ),
  
  (7, 'Location type for each AZ', 'multiple-choice', 8, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '7a', 'text', 'Urban'),
      jsonb_build_object('id', '7b', 'text', 'Industrial'),
      jsonb_build_object('id', '7c', 'text', 'Suburban'),
      jsonb_build_object('id', '7d', 'text', 'Rural'),
      jsonb_build_object('id', '7e', 'text', 'Small town')
    ),
    NULL
  ),
  
  (8, 'Relevant municipalities to each AZ', 'multiple-choice', 9, NULL,
    jsonb_build_object(
      'enabled', false,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '8b', 'text', 'Town'),
      jsonb_build_object('id', '8c', 'text', 'Township'),
      jsonb_build_object('id', '8d', 'text', 'County'),
      jsonb_build_object('id', '8e', 'text', 'Other')
    ),
    NULL
  ),
  
  (9, 'AHJ for each AZ', 'multiple-choice', NULL, NULL,
    jsonb_build_object(
      'enabled', true,
      'maxFiles', 1,
      'required', false,
      'fileLabels', jsonb_build_array('Upload File'),
      'formConfigs', jsonb_build_array(
        jsonb_build_array(
          jsonb_build_object(
            'id', '6b85fdcc-cff1-4ec3-afe8-b4b991497b0a',
            'type', 'text',
            'label', 'Name of file',
            'validation', jsonb_build_object('required', true),
            'placeholder', ''
          ),
          jsonb_build_object(
            'id', 'c2987bbb-a9ba-455a-a6ac-81da80cb3b7b',
            'type', 'memo',
            'label', 'Findings',
            'validation', jsonb_build_object('required', true),
            'placeholder', ''
          )
        )
      ),
      'fileRequirements', jsonb_build_array(false)
    ),
    NULL,
    jsonb_build_array(
      jsonb_build_object('id', '9a', 'text', 'Permit Granting authority')
    ),
    NULL
  );