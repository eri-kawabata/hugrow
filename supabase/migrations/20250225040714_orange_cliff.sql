/*
  # Create profiles and works tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `username` (text)
      - `avatar_url` (text)
      - `role` (text) - 'child' or 'parent'
      - `created_at` (timestamp)
    - `works`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `media_url` (text)
      - `media_type` (text) - 'image', 'video', or 'audio'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  username text,
  avatar_url text,
  role text CHECK (role IN ('child', 'parent')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create works table
CREATE TABLE IF NOT EXISTS works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video', 'audio')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Works policies
CREATE POLICY "Users can view all works"
  ON works
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own works"
  ON works
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own works"
  ON works
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);