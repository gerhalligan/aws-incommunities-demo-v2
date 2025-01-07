/*
  # Update user settings schema for multiple AI providers

  1. Changes
    - Add JSON schema validation for the settings column in user_settings table
    - Ensures the AI settings follow the expected structure
    - Maintains backward compatibility with existing settings

  2. Schema Details
    - ai.provider: Must be either 'openai' or 'perplexity'
    - ai.openaiApiKey: Optional string for OpenAI API key
    - ai.perplexityApiKey: Optional string for Perplexity API key
*/

-- Add JSON schema validation for the settings column
ALTER TABLE user_settings
ADD CONSTRAINT settings_schema CHECK (
  jsonb_typeof(settings->'ai') IS NULL OR (
    jsonb_typeof(settings->'ai') = 'object' AND
    (
      settings->'ai'->>'provider' IS NULL OR
      settings->'ai'->>'provider' IN ('openai', 'perplexity')
    ) AND
    (
      settings->'ai'->>'openaiApiKey' IS NULL OR
      jsonb_typeof(settings->'ai'->'openaiApiKey') = 'string'
    ) AND
    (
      settings->'ai'->>'perplexityApiKey' IS NULL OR
      jsonb_typeof(settings->'ai'->'perplexityApiKey') = 'string'
    )
  )
);

-- Create an index to improve query performance when filtering by AI provider
CREATE INDEX IF NOT EXISTS idx_user_settings_ai_provider ON user_settings ((settings->'ai'->>'provider'));