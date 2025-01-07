/*
  # Add function to get current user auth data

  1. New Functions
    - get_current_user: Returns auth data for the current user
    - get_current_user_profile: Returns profile data for the current user
*/

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

-- Update get_auth_users function to use separate queries
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

  -- Return all users data with separate queries
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
  FROM auth.users au
  LEFT JOIN LATERAL (
    SELECT role, last_login 
    FROM profiles 
    WHERE profiles.id = au.id
  ) p ON true
  ORDER BY COALESCE(p.last_login, au.created_at) DESC;
END;
$$;