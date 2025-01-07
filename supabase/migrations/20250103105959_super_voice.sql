-- Revoke all existing grants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Grant basic schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant specific table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Grant sequence usage for serial columns
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure auth.users is accessible
GRANT SELECT ON auth.users TO authenticated, service_role;

-- Ensure proper grants for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Drop and recreate handle_new_user with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _error_detail text;
BEGIN
  -- Log the attempt
  RAISE LOG 'Attempting to create profile for user %', NEW.id;
  
  BEGIN
    INSERT INTO public.profiles (id, role, created_at, updated_at)
    VALUES (
      NEW.id,
      'user',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
    
    RAISE LOG 'Successfully created profile for user %', NEW.id;
    RETURN NEW;
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'Profile already exists for user %', NEW.id;
      RETURN NEW;
    WHEN others THEN
      GET STACKED DIAGNOSTICS _error_detail = PG_EXCEPTION_DETAIL;
      RAISE LOG 'Error creating profile for user %. Detail: %, Error: %', 
        NEW.id, _error_detail, SQLERRM;
      RETURN NEW;
  END;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled but with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Create simplified policies
CREATE POLICY "allow_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "allow_insert" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Verify existing profiles
DO $$
BEGIN
  INSERT INTO profiles (id, role, created_at, updated_at)
  SELECT 
    id,
    'user',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
  );
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error verifying profiles: %', SQLERRM;
END;
$$;