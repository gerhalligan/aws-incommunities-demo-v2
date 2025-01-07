-- Drop and recreate auth token handling
DO $$
BEGIN
  -- Ensure authenticated role exists and has proper permissions
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;

  -- Grant basic permissions to authenticated role
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT USAGE ON SCHEMA auth TO authenticated;
  
  -- Grant specific table permissions
  GRANT SELECT ON TABLE auth.users TO authenticated;
  GRANT ALL ON TABLE public.profiles TO authenticated;
  
  -- Ensure service role has necessary permissions
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
      -- Don't raise exception to prevent login failures
  END;
  $$;

  -- Grant execute permission on the function
  GRANT EXECUTE ON FUNCTION auth.grant_authenticated_role() TO anon;
  GRANT EXECUTE ON FUNCTION auth.grant_authenticated_role() TO authenticated;
  
  -- Ensure proper search path for auth schema
  ALTER SCHEMA auth OWNER TO supabase_auth_admin;
  
  -- Reset role memberships
  GRANT authenticated TO postgres;
  GRANT service_role TO postgres;
  
END $$;

-- Add error logging for auth token generation
CREATE OR REPLACE FUNCTION auth.log_token_generation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE LOG 'Token generation for user: %, Event: token_generated',
    NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger for token generation logging
DROP TRIGGER IF EXISTS on_token_generation ON auth.refresh_tokens;
CREATE TRIGGER on_token_generation
  AFTER INSERT ON auth.refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION auth.log_token_generation();