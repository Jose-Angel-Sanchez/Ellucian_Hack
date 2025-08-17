-- Fix course_sections RLS policies to allow proper CRUD operations

-- Drop restrictive policies
DROP POLICY IF EXISTS "Solo creadores pueden gestionar secciones" ON course_sections;

-- Create more permissive policies for course_sections

-- Allow users to view sections of any active course
DROP POLICY IF EXISTS "Todos pueden ver secciones de cursos activos" ON course_sections;
CREATE POLICY "Todos pueden ver secciones de cursos activos" ON course_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.is_active = true
        )
    );

-- Allow course creators to insert sections to their courses
CREATE POLICY "Creadores pueden insertar secciones" ON course_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.created_by = auth.uid()
        )
    );

-- Allow course creators to update sections of their courses
CREATE POLICY "Creadores pueden actualizar secciones" ON course_sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.created_by = auth.uid()
        )
    );

-- Allow course creators to delete sections of their courses
CREATE POLICY "Creadores pueden eliminar secciones" ON course_sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.created_by = auth.uid()
        )
    );

-- Also fix section_content policies if they have similar issues
DROP POLICY IF EXISTS "Solo creadores pueden gestionar contenido" ON section_content;

-- Allow users to view content of active courses
DROP POLICY IF EXISTS "Todos pueden ver contenido de cursos activos" ON section_content;
CREATE POLICY "Todos pueden ver contenido de cursos activos" ON section_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_sections
            JOIN courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = section_content.section_id
            AND courses.is_active = true
        )
    );

-- Allow course creators to manage section content
CREATE POLICY "Creadores pueden gestionar contenido" ON section_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM course_sections
            JOIN courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = section_content.section_id
            AND courses.created_by = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON course_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON section_content TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
