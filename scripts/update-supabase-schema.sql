-- Update the questions table to add category and difficulty
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT;

-- Create categories for the questions
UPDATE questions SET category = 
  CASE 
    WHEN question_text ILIKE '%government%' OR question_text ILIKE '%parliament%' OR question_text ILIKE '%election%' OR question_text ILIKE '%vote%' OR question_text ILIKE '%prime minister%' OR question_text ILIKE '%governor%' THEN 'Government and Democracy'
    WHEN question_text ILIKE '%history%' OR question_text ILIKE '%confederation%' OR question_text ILIKE '%war%' OR question_text ILIKE '%1867%' THEN 'Canadian History'
    WHEN question_text ILIKE '%province%' OR question_text ILIKE '%territory%' OR question_text ILIKE '%region%' OR question_text ILIKE '%lake%' OR question_text ILIKE '%mountain%' THEN 'Geography'
    WHEN question_text ILIKE '%right%' OR question_text ILIKE '%freedom%' OR question_text ILIKE '%charter%' OR question_text ILIKE '%law%' OR question_text ILIKE '%legal%' THEN 'Rights and Responsibilities'
    WHEN question_text ILIKE '%aboriginal%' OR question_text ILIKE '%first nation%' OR question_text ILIKE '%inuit%' OR question_text ILIKE '%métis%' THEN 'Indigenous Peoples'
    WHEN question_text ILIKE '%symbol%' OR question_text ILIKE '%flag%' OR question_text ILIKE '%anthem%' OR question_text ILIKE '%holiday%' THEN 'Canadian Symbols and Identity'
    ELSE 'General Knowledge'
  END
WHERE category IS NULL;

-- Create quiz_attempts table to track user quiz history
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_taken INTEGER, -- in seconds
  is_timed BOOLEAN DEFAULT FALSE,
  quiz_type TEXT DEFAULT 'standard', -- 'standard', 'practice', 'timed'
  category TEXT -- for practice mode by category
);

-- Create user_incorrect_questions table to track questions users get wrong
CREATE TABLE IF NOT EXISTS user_incorrect_questions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  question_id INTEGER NOT NULL REFERENCES questions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_incorrect INTEGER DEFAULT 1,
  UNIQUE(user_id, question_id)
);

-- Add RLS policies for the new tables
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_incorrect_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_incorrect_questions
CREATE POLICY "Users can view their own incorrect questions"
  ON user_incorrect_questions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incorrect questions"
  ON user_incorrect_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incorrect questions"
  ON user_incorrect_questions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
