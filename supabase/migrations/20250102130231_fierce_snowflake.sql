-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_last_login();

-- Create improved last_login update function
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET last_login = NEW.created_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_login ON auth.sessions;

-- Create trigger for auth.sessions
CREATE TRIGGER on_auth_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- Backfill last_login for existing users
UPDATE profiles p
SET last_login = (
  SELECT MAX(created_at)
  FROM auth.sessions s
  WHERE s.user_id = p.id
)
WHERE last_login IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id_created_at 
ON auth.sessions(user_id, created_at DESC);

-- Update function to get auth users to include more session data
CREATE OR REPLACE FUNCTION get_auth_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  email_confirmed_at timestamptz,
  phone text,
  confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  role text,
  last_login timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if requesting user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return full user data with explicit table references
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    au.email_confirmed_at,
    au.phone::text,
    au.confirmed_at,
    au.last_sign_in_at,
    p.role,
    p.last_login
  FROM auth.users AS au
  LEFT JOIN profiles p ON p.id = au.id
  ORDER BY COALESCE(p.last_login, au.created_at) DESC;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;