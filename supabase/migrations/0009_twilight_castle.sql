/*
  # Add Repeater Configuration Support

  1. Changes
    - Add repeater_config column to questions table
    - Add JSON schema validation for repeater_config
*/

-- Add repeater_config column
ALTER TABLE questions
ADD COLUMN repeater_config jsonb;

-- Add JSON schema validation
ALTER TABLE questions
ADD CONSTRAINT questions_repeater_config_check
CHECK (
  jsonb_typeof(repeater_config) IS NULL OR (
    jsonb_typeof(repeater_config) = 'object' AND
    jsonb_typeof(repeater_config->'fields') = 'array' AND
    (
      repeater_config->>'minEntries' IS NULL OR
      jsonb_typeof(repeater_config->'minEntries') = 'number'
    ) AND
    (
      repeater_config->>'maxEntries' IS NULL OR
      jsonb_typeof(repeater_config->'maxEntries') = 'number'
    )
  )
);