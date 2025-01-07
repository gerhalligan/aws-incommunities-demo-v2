/*
  # Add unique constraint to user_settings

  1. Changes
    - Adds unique constraint on user_id column
    - Ensures each user can only have one settings record
    - Enables upsert operations with ON CONFLICT
  
  2. Security
    - Maintains existing RLS policies
    - Preserves foreign key relationship
*/

-- Add unique constraint to user_id
ALTER TABLE user_settings
ADD CONSTRAINT user_settings_user_id_key UNIQUE (user_id);

-- Add index for the unique constraint if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id_unique 
ON user_settings(user_id);

-- Ensure there are no duplicate user_id entries
DELETE FROM user_settings a USING (
  SELECT MIN(id) as id, user_id
  FROM user_settings 
  GROUP BY user_id
  HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id 
AND a.id <> b.id;