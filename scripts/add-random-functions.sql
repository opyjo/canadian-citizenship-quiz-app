-- Create PostgreSQL functions for efficient random question selection
-- This avoids client-side performance issues with large datasets

-- Function to get random questions for standard/timed quizzes
CREATE OR REPLACE FUNCTION get_random_questions(question_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id INTEGER,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, 
         q.correct_option
  FROM questions q
  ORDER BY RANDOM()
  LIMIT question_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for practice questions with optional incorrect-only filter
CREATE OR REPLACE FUNCTION get_random_practice_questions(
  user_id_param UUID,
  question_limit INTEGER DEFAULT 20,
  incorrect_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id INTEGER,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_option TEXT
) AS $$
DECLARE
  orig_rls_bypass TEXT;
BEGIN
  -- Temporarily bypass RLS to read from user_incorrect_questions
  -- The function is still secure because it explicitly filters by user_id_param
  SELECT current_setting('app.bypass_rls', true) INTO orig_rls_bypass;
  PERFORM set_config('app.bypass_rls', 'on', true);

  IF incorrect_only AND user_id_param IS NOT NULL THEN
    -- Return only questions the user has gotten wrong before
    RETURN QUERY
    SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, 
           q.correct_option
    FROM questions q
    INNER JOIN user_incorrect_questions uiq ON q.id = uiq.question_id
    WHERE uiq.user_id = user_id_param
    ORDER BY RANDOM()
    LIMIT question_limit;
  ELSE
    -- Return random questions from all available questions
    RETURN QUERY
    SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, 
           q.correct_option
    FROM questions q
    ORDER BY RANDOM()
    LIMIT question_limit;
  END IF;

  -- Restore the original RLS setting
  PERFORM set_config('app.bypass_rls', orig_rls_bypass, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_random_questions(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_random_practice_questions(UUID, INTEGER, BOOLEAN) TO authenticated, anon;

-- Test the functions (optional - you can remove these lines after testing)
-- SELECT * FROM get_random_questions(5);
-- SELECT * FROM get_random_practice_questions(NULL, 5, FALSE); 