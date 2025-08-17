-- Fix courses table and RLS policies

-- First, add the missing created_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'courses' AND column_name = 'created_by') THEN
        ALTER TABLE courses ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create RLS policies for courses table to allow CRUD operations
-- Note: PostgreSQL doesn't support IF NOT EXISTS for policies, so we drop and recreate

-- Policy for inserting courses - authenticated users can create courses
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
CREATE POLICY "Authenticated users can create courses" 
ON courses FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for updating courses - users can update their own courses
DROP POLICY IF EXISTS "Users can update own courses" ON courses;
CREATE POLICY "Users can update own courses" 
ON courses FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by OR auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Policy for deleting courses - users can delete their own courses
DROP POLICY IF EXISTS "Users can delete own courses" ON courses;
CREATE POLICY "Users can delete own courses" 
ON courses FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by OR auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- Update existing courses to have a created_by value if they don't have one
-- This sets all existing courses to be owned by any existing user
UPDATE courses 
SET created_by = (
  SELECT id FROM auth.users LIMIT 1
)
WHERE created_by IS NULL;

-- Grant additional permissions to ensure proper access
GRANT SELECT, INSERT, UPDATE, DELETE ON courses TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
