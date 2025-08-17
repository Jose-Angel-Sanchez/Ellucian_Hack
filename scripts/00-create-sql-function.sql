-- Create function to execute SQL scripts
CREATE OR REPLACE FUNCTION execute_sql_script(sql_script text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_script;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
