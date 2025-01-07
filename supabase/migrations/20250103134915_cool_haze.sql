/*
  # Create get_auth_users function

  1. Function Creation
    - Creates secure function to fetch auth users data
    - Includes role-based access control
    - Returns user and profile data
  
  2. Security
    - Only accessible by admin users
    - Uses security definer
    - Sets proper search path
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_auth_users();

-- Create function with proper security
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

  -- Return all users data with profile information
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
  LEFT JOIN profiles p ON p.id = au.id
  ORDER BY COALESCE(p.last_login, au.created_at) DESC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;

-- Add comment explaining function
COMMENT ON FUNCTION get_auth_users() IS 'Securely fetch auth users data for admin users only';