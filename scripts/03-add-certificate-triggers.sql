-- Function to automatically generate certificate when course is completed
CREATE OR REPLACE FUNCTION generate_certificate_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if progress is 100% (course completed)
  IF NEW.progress_percentage = 100 AND (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) THEN
    -- Generate certificate
    INSERT INTO certificates (
      user_id,
      course_id,
      completion_date,
      certificate_id
    ) VALUES (
      NEW.user_id,
      NEW.course_id,
      NOW(),
      'CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-' || EXTRACT(YEAR FROM NOW())
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic certificate generation
DROP TRIGGER IF EXISTS trigger_generate_certificate ON user_progress;
CREATE TRIGGER trigger_generate_certificate
  AFTER UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION generate_certificate_on_completion();

-- Add some sample certificates for testing
INSERT INTO certificates (user_id, course_id, completion_date, certificate_id)
SELECT 
  up.user_id,
  up.course_id,
  NOW() - INTERVAL '1 day',
  'CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) || '-2024'
FROM user_progress up
WHERE up.progress_percentage = 100
AND NOT EXISTS (
  SELECT 1 FROM certificates c 
  WHERE c.user_id = up.user_id AND c.course_id = up.course_id
);
