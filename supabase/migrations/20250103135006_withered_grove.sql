/*
  # Create get_auth_users function

  1. Function Creation
    - Creates function to fetch auth users data
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
  role text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    -- Return all profiles and auth user data for admins
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
  ELSE
    -- Return only the requesting user's profile and auth user data
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
    WHERE au.id = auth.uid();
  END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;

-- Add comment explaining function
COMMENT ON FUNCTION get_auth_users() IS 'Fetch auth users data based on user role - admins see all users, others see only themselves';