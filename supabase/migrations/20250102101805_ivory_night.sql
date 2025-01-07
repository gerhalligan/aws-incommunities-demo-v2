/*
  # Add Profile Fields

  1. New Fields
    - display_name (text)
    - phone_number (text)
    - last_login (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for user and admin access
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles (display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles (last_login);

-- Update RLS policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  CASE 
    WHEN auth.uid() = id THEN 
      -- Regular users can't change their role
      (role IS NULL OR role = (SELECT role FROM profiles WHERE id = auth.uid()))
    ELSE false
  END
);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET last_login = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_login on auth.sessions
CREATE OR REPLACE TRIGGER on_auth_login
AFTER INSERT ON auth.sessions
FOR EACH ROW
EXECUTE FUNCTION update_last_login();