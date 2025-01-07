-- Disable RLS temporarily to allow system operations
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Drop and recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon, authenticated, service_role;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "Enable read access for all users"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authentication system"
    ON profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for users based on id"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);