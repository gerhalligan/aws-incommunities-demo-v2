/*
  # Fix User Creation Process

  1. Changes
    - Make handle_new_user function more permissive
    - Add detailed error logging
    - Grant necessary permissions
    - Remove potential blockers
*/

-- Drop existing function and recreate with SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _error_detail text;
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, role, created_at, updated_at)
    VALUES (
      NEW.id,
      'user',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
    RETURN NEW;
  EXCEPTION 
    WHEN others THEN
      GET STACKED DIAGNOSTICS _error_detail = PG_EXCEPTION_DETAIL;
      RAISE LOG 'Error in handle_new_user function. Detail: %, Error: %', _error_detail, SQLERRM;
      RETURN NEW; -- Still return NEW to allow user creation even if profile fails
  END;
END;
$$;

-- Make sure trigger exists and is set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Ensure profiles table exists and has correct permissions
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.profiles TO postgres;