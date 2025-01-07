/*
  # Add auth users access function
  
  1. New Functions
    - get_auth_users() - Securely fetch auth.users data
    
  2. Security
    - Function uses SECURITY DEFINER to access auth schema
    - Access controlled through RLS policies
    
  3. Changes
    - Adds ability to query auth users through secure function
*/

-- Create function to securely access auth.users
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
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return filtered auth users data
  RETURN QUERY
  SELECT 
    u.id,
    u.email::text,
    u.created_at
  FROM auth.users u;
END;
$$;

-- Revoke direct access to function from public
REVOKE ALL ON FUNCTION get_auth_users() FROM PUBLIC;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;

-- Add comment explaining function
COMMENT ON FUNCTION get_auth_users() IS 'Securely fetch auth.users data for admin users only';