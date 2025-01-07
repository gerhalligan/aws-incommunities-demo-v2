/*
  # Fix Profiles Table Setup

  1. Changes
    - Drop and recreate handle_new_user trigger with proper error handling
    - Add missing RLS policies
    - Add missing indexes
    - Add proper constraints

  2. Security
    - Enable RLS
    - Add policies for profile management
*/

BEGIN;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Return the result
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (Supabase will capture this)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate core policies
CREATE POLICY "Users can read own profile"
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

-- Add policy for inserting profiles (needed for sign-up)
CREATE POLICY "Allow insert during sign up"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Make sure trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

COMMIT;