-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS handle_auth_user() CASCADE;
DROP FUNCTION IF EXISTS process_auth_token() CASCADE;

-- Create function to handle auth user creation in public schema
CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (
    NEW.id,
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION 
  WHEN others THEN
    RAISE LOG 'Error in handle_auth_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create function to process auth tokens in public schema
CREATE OR REPLACE FUNCTION public.process_auth_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update last login timestamp
  UPDATE profiles
  SET last_login = CURRENT_TIMESTAMP
  WHERE id = NEW.user_id;
  
  RETURN NEW;
EXCEPTION 
  WHEN others THEN
    RAISE LOG 'Error in process_auth_token: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_auth_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.process_auth_token() TO postgres;

-- Create triggers in auth schema
DO $$
BEGIN
  -- Only create trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_auth_user();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_token_created'
  ) THEN
    CREATE TRIGGER on_auth_token_created
      AFTER INSERT ON auth.refresh_tokens
      FOR EACH ROW
      EXECUTE FUNCTION public.process_auth_token();
  END IF;
END $$;

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;