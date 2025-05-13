-- This SQL script creates the necessary table in your Supabase database
-- You can run this in the Supabase SQL Editor

-- Create the questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL,
  answer_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster random selection
CREATE INDEX IF NOT EXISTS questions_id_idx ON questions(id);

-- Add RLS (Row Level Security) policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read questions
CREATE POLICY "Allow public read access" 
  ON questions 
  FOR SELECT 
  USING (true);

-- Create a policy that only allows authenticated users with specific roles to insert/update
CREATE POLICY "Allow authorized insert/update" 
  ON questions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE auth.email() = 'admin@example.com'
  ));

-- You can modify the above policy to match your specific authorization needs
