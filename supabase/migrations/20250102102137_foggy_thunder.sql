/*
  # Fix Auth Users Relation

  1. Changes
    - Add foreign key constraint to profiles table
    - Update RLS policies to handle auth.users relation
*/

-- Add foreign key constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update RLS policies to handle auth.users relation
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  CASE 
    WHEN auth.uid() = id THEN 
      -- Regular users can't change their role
      (role IS NULL OR role = (SELECT role FROM profiles WHERE id = auth.uid()))
    ELSE false
  END
);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);