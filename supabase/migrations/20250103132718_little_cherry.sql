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
  default_role text := 'user';
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (
    id,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    default_role,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;

  -- Grant necessary permissions to the new user
  EXECUTE format(
    'GRANT authenticated TO "%s"',
    NEW.email
  );

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error but don't prevent user creation
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS is enabled with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;

-- Create simplified policies
CREATE POLICY "allow_read_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "allow_insert_own_profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Fix any missing profiles
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);