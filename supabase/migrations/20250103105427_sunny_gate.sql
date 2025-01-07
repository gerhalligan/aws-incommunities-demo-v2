-- Temporarily disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _error_detail text;
BEGIN
  -- Insert with conflict handling
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION 
  WHEN others THEN
    GET STACKED DIAGNOSTICS _error_detail = PG_EXCEPTION_DETAIL;
    RAISE LOG 'Error in handle_new_user: %, Detail: %', SQLERRM, _error_detail;
    RETURN NEW;
END;
$$;

-- Recreate trigger with proper timing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Ensure profiles table has correct permissions
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.profiles TO anon;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication system" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Allow insert during sign up" ON profiles;
DROP POLICY IF EXISTS "Allow auth system to read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow auth system to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "profiles_read_policy" 
ON profiles FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify and fix any existing profile issues
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
  users.id,
  'user',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM auth.users
LEFT JOIN profiles ON users.id = profiles.id
WHERE profiles.id IS NULL;