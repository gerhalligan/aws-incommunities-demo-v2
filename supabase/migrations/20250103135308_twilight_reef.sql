/*
  # Create profiles table

  1. Table Creation
    - Creates profiles table for storing user profile data
    - Includes role, timestamps, and contact info
    - Adds foreign key reference to auth.users
  
  2. Security
    - Enables RLS
    - Adds policies for access control
*/

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  display_name text,
  phone_number text,
  last_login timestamptz,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'))
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow insert during signup"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON TABLE profiles TO authenticated;

-- Add indexes for performance
CREATE INDEX idx_profiles_id ON profiles(id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_last_login ON profiles(last_login);