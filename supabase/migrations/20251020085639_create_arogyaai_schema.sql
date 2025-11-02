/*
  # ArogyaAI Database Schema

  ## Overview
  Creates the complete database schema for the ArogyaAI healthcare assistant application.
  This migration sets up tables for user profiles, chat history, and doctor appointments with
  proper security policies.

  ## New Tables
  
  ### `user_profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique, not null) - User email address
  - `full_name` (text) - User's full name
  - `preferred_language` (text, default 'English') - User's language preference
  - `created_at` (timestamptz, default now()) - Account creation timestamp
  - `updated_at` (timestamptz, default now()) - Last update timestamp
  
  ### `chat_history`
  - `id` (uuid, primary key) - Unique chat record ID
  - `user_id` (uuid, foreign key) - References user_profiles.id
  - `bot_type` (text, not null) - Type of bot (general, mental, image_voice)
  - `message` (text, not null) - User's message
  - `response` (text, not null) - Bot's response
  - `language` (text, default 'English') - Language used in conversation
  - `created_at` (timestamptz, default now()) - Message timestamp
  
  ### `doctor_appointments`
  - `id` (uuid, primary key) - Unique appointment ID
  - `user_id` (uuid, foreign key) - References user_profiles.id
  - `doctor_name` (text, not null) - Doctor's name
  - `specialization` (text) - Doctor's specialization
  - `location` (text) - Clinic/hospital location
  - `phone_number` (text) - Contact number
  - `appointment_date` (timestamptz) - Scheduled appointment time
  - `status` (text, default 'scheduled') - Appointment status
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz, default now()) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Policies ensure users can only access their own data
  - Authenticated users required for all operations
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  preferred_language text DEFAULT 'English',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  bot_type text NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  language text DEFAULT 'English',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
  ON chat_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create doctor_appointments table
CREATE TABLE IF NOT EXISTS doctor_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  specialization text,
  location text,
  phone_number text,
  appointment_date timestamptz,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON doctor_appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON doctor_appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON doctor_appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON doctor_appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_bot_type ON chat_history(bot_type);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON doctor_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON doctor_appointments(appointment_date);
