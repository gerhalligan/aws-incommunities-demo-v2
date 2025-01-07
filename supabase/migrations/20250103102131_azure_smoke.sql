-- Ensure proper permissions for auth system
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Allow insert during sign up" ON profiles;

-- Create a policy that allows the auth system to read profiles
CREATE POLICY "Allow auth system to read profiles"
ON profiles FOR SELECT
USING (true);

-- Create a policy that allows the auth system to insert profiles
CREATE POLICY "Allow auth system to insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- Create a policy that allows users to update their own profiles
CREATE POLICY "Users can update own profiles"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to auth system roles
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);