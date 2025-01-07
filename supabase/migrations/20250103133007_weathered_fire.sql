-- Ensure proper role setup
DO $$
BEGIN
  -- Create authenticated role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  
  -- Grant proper permissions
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
  
  -- Ensure auth schema permissions
  GRANT USAGE ON SCHEMA auth TO authenticated;
  GRANT SELECT ON auth.users TO authenticated;
  
  -- Reset handle_new_user function permissions
  ALTER FUNCTION handle_new_user() SECURITY DEFINER;
  REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres;
  
  -- Ensure profiles table permissions
  GRANT ALL ON TABLE profiles TO authenticated;
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
END $$;

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

-- Add error logging trigger
CREATE OR REPLACE FUNCTION log_auth_errors()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    RAISE LOG 'Auth operation: %, User: %, Event: %', 
      TG_OP, 
      NEW.id, 
      NEW.created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auth_error_logger ON auth.users;
CREATE TRIGGER auth_error_logger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION log_auth_errors();

-- Verify and fix any existing profiles
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