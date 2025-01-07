-- Drop existing function
DROP FUNCTION IF EXISTS get_auth_users();

-- Create updated function with explicit table references
CREATE OR REPLACE FUNCTION get_auth_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
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

  -- Return filtered auth users data with explicit table references
  RETURN QUERY
  SELECT 
    auth_users.id,
    auth_users.email::text,
    auth_users.created_at
  FROM auth.users AS auth_users;
END;
$$;

-- Revoke direct access to function from public
REVOKE ALL ON FUNCTION get_auth_users() FROM PUBLIC;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;

-- Add comment explaining function
COMMENT ON FUNCTION get_auth_users() IS 'Securely fetch auth.users data for admin users only';