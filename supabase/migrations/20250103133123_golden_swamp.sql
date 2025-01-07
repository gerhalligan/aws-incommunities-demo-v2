-- Drop existing functions and triggers first
DROP TRIGGER IF EXISTS on_token_generation ON auth.refresh_tokens;
DROP FUNCTION IF EXISTS auth.log_token_generation();
DROP FUNCTION IF EXISTS auth.grant_authenticated_role();

-- Create authenticated role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
END $$;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON TABLE auth.users TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT authenticated TO service_role;

-- Create function to handle auth token generation
CREATE OR REPLACE FUNCTION auth.grant_authenticated_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  GRANT authenticated TO current_user;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error granting authenticated role: %', SQLERRM;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.grant_authenticated_role() TO anon;
GRANT EXECUTE ON FUNCTION auth.grant_authenticated_role() TO authenticated;

-- Set schema ownership
ALTER SCHEMA auth OWNER TO supabase_auth_admin;

-- Reset role memberships
GRANT authenticated TO postgres;
GRANT service_role TO postgres;

-- Create token generation logging function
CREATE OR REPLACE FUNCTION auth.log_token_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE LOG 'Token generation for user: %, Event: token_generated', NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create token generation trigger
CREATE TRIGGER on_token_generation
  AFTER INSERT ON auth.refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION auth.log_token_generation();

-- Ensure proper RLS policies
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- Recreate core RLS policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_read_policy" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);