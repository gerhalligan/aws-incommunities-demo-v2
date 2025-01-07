/*
  # Create user settings table

  1. Table Creation
    - Creates user_settings table for storing user preferences and settings
    - Includes JSON validation for settings structure
    - Adds foreign key constraint to auth.users
  
  2. Security
    - Enables RLS
    - Adds policies for access control
*/

-- Create user_settings table
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (id),
  CONSTRAINT user_settings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  CONSTRAINT settings_schema_check CHECK (
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
  )
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON TABLE user_settings TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_ai_provider ON user_settings((settings->'ai'->>'provider'));

-- Add updated_at trigger
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();