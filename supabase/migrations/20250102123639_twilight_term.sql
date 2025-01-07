-- Drop existing function
DROP FUNCTION IF EXISTS get_auth_users();

-- Create updated function with full user data
CREATE OR REPLACE FUNCTION get_auth_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  email_confirmed_at timestamptz,
  phone text,
  confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  role text
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
    p.role
  FROM auth.users AS au
  LEFT JOIN profiles p ON p.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Revoke direct access to function from public
REVOKE ALL ON FUNCTION get_auth_users() FROM PUBLIC;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;

-- Add comment explaining function
COMMENT ON FUNCTION get_auth_users() IS 'Securely fetch complete auth.users data for admin users only';