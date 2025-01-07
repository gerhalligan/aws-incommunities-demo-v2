BEGIN;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_current_user();
DROP FUNCTION IF EXISTS get_current_user_profile();

-- Function to get current user's auth data
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  email_confirmed_at timestamptz,
  phone text,
  confirmed_at timestamptz,
  last_sign_in_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.created_at,
    au.email_confirmed_at,
    au.phone::text,
    au.confirmed_at,
    au.last_sign_in_at
  FROM auth.users AS au
  WHERE au.id = auth.uid();
END;
$$;

-- Function to get current user's profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
  id uuid,
  role text,
  display_name text,
  phone_number text,
  last_login timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.role,
    p.display_name,
    p.phone_number,
    p.last_login,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;

COMMIT;