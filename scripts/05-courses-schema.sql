-- Crear tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER NOT NULL, -- en minutos
    thumbnail_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure created_by column exists if table was created previously without it
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- Ensure thumbnail_url column exists if table was created previously without it
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Crear tabla para las secciones de los cursos
CREATE TABLE IF NOT EXISTS course_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(course_id, order_index)
);

-- Crear tabla para el contenido de las secciones
CREATE TABLE IF NOT EXISTS section_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'text', 'quiz', 'exercise')),
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    duration INTEGER, -- en minutos, para contenido multimedia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(section_id, order_index)
);

-- Habilitar RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_content ENABLE ROW LEVEL SECURITY;

-- Auto-fill created_by on insert
CREATE OR REPLACE FUNCTION set_courses_created_by()
RETURNS trigger AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_courses_created_by_trigger ON courses;
CREATE TRIGGER set_courses_created_by_trigger
    BEFORE INSERT ON courses
    FOR EACH ROW
    EXECUTE FUNCTION set_courses_created_by();

-- Políticas para cursos
DROP POLICY IF EXISTS "Todos pueden ver cursos activos" ON courses;
CREATE POLICY "Todos pueden ver cursos activos" ON courses
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Solo superusuarios pueden crear cursos" ON courses;
CREATE POLICY "Solo superusuarios pueden crear cursos" ON courses
        FOR INSERT WITH CHECK (
                (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx') AND (
                    created_by IS NULL OR created_by = auth.uid()
                )
        );

DROP POLICY IF EXISTS "Solo creadores pueden actualizar sus cursos" ON courses;
CREATE POLICY "Solo creadores pueden actualizar sus cursos" ON courses
    FOR UPDATE USING (
        auth.uid() = created_by AND
        (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

DROP POLICY IF EXISTS "Solo creadores pueden eliminar sus cursos" ON courses;
CREATE POLICY "Solo creadores pueden eliminar sus cursos" ON courses
    FOR DELETE USING (
        auth.uid() = created_by AND
        (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

-- Políticas para secciones
DROP POLICY IF EXISTS "Todos pueden ver secciones de cursos activos" ON course_sections;
CREATE POLICY "Todos pueden ver secciones de cursos activos" ON course_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.is_active = true
        )
    );

DROP POLICY IF EXISTS "Solo creadores pueden gestionar secciones" ON course_sections;
CREATE POLICY "Solo creadores pueden gestionar secciones" ON course_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.created_by = auth.uid()
            AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
        )
    );

-- Políticas para contenido de secciones
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

DROP POLICY IF EXISTS "Solo creadores pueden gestionar contenido" ON section_content;
CREATE POLICY "Solo creadores pueden gestionar contenido" ON section_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM course_sections
            JOIN courses ON courses.id = course_sections.course_id
            WHERE course_sections.id = section_content.section_id
            AND courses.created_by = auth.uid()
            AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
        )
    );

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_sections_updated_at ON course_sections;
CREATE TRIGGER update_course_sections_updated_at
    BEFORE UPDATE ON course_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_section_content_updated_at ON section_content;
CREATE TRIGGER update_section_content_updated_at
    BEFORE UPDATE ON section_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
