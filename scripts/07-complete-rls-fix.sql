-- Complete RLS Policy Fix for Courses and Course Sections
-- Execute this entire script in Supabase SQL Editor to fix all permission issues

-- Step 0: Ensure RLS is enabled on target tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

-- Step 1: Ensure courses table has created_by column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Step 2: Drop ALL existing policies on courses (name-agnostic)
DO $$
BEGIN
	EXECUTE (
		SELECT string_agg(format('DROP POLICY IF EXISTS %I ON courses;', policyname), ' ')
		FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'courses'
	);
END$$;

-- Step 3: Create clean, ownership-based policies for courses
-- Allow authenticated users to read courses (adjust to restrict if needed)
CREATE POLICY "courses_select_all_authenticated"
ON courses FOR SELECT TO authenticated USING (true);

-- Only allow insert when created_by = current user
CREATE POLICY "courses_insert_own"
ON courses FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Only allow update/delete on own courses
CREATE POLICY "courses_update_own"
ON courses FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "courses_delete_own"
ON courses FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Step 4: Drop ALL existing policies on course_sections (name-agnostic)
DO $$
BEGIN
	EXECUTE (
		SELECT string_agg(format('DROP POLICY IF EXISTS %I ON course_sections;', policyname), ' ')
		FROM pg_policies
		WHERE schemaname = 'public' AND tablename = 'course_sections'
	);
END$$;

-- Step 5: Create ownership-based policies for course_sections
-- Allow authenticated users to read sections
CREATE POLICY "course_sections_select_all_authenticated"
ON course_sections FOR SELECT TO authenticated USING (true);

-- Only allow insert/update/delete on sections of courses owned by the user
CREATE POLICY "course_sections_insert_owned_course"
ON course_sections FOR INSERT TO authenticated
WITH CHECK (
	EXISTS (
		SELECT 1 FROM courses c
		WHERE c.id = course_sections.course_id
			AND c.created_by = auth.uid()
	)
);

CREATE POLICY "course_sections_update_owned_course"
ON course_sections FOR UPDATE TO authenticated
USING (
	EXISTS (
		SELECT 1 FROM courses c
		WHERE c.id = course_sections.course_id
			AND c.created_by = auth.uid()
	)
);

CREATE POLICY "course_sections_delete_owned_course"
ON course_sections FOR DELETE TO authenticated
USING (
	EXISTS (
		SELECT 1 FROM courses c
		WHERE c.id = course_sections.course_id
			AND c.created_by = auth.uid()
	)
);

-- Step 6: (Optional) Set ownership on legacy rows to current user
-- Run while logged in as the intended owner in the SQL Editor session
UPDATE courses SET created_by = auth.uid() WHERE created_by IS NULL;

-- Step 7: Verify the policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('courses', 'course_sections')
ORDER BY tablename, policyname;
