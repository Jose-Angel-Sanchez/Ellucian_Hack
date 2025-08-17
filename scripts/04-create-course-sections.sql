-- Crear tabla de secciones de curso
CREATE TABLE IF NOT EXISTS course_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de contenido de secciones
CREATE TABLE IF NOT EXISTS section_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'video', 'text', 'quiz', 'file'
    content_data JSONB, -- Almacena datos específicos del tipo de contenido
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    estimated_duration INTEGER, -- en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_order ON course_sections(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_section_content_section_id ON section_content(section_id);
CREATE INDEX IF NOT EXISTS idx_section_content_order ON section_content(section_id, order_index);

-- RLS (Row Level Security) para course_sections
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen para evitar errores
DROP POLICY IF EXISTS "Users can view course sections of their courses" ON course_sections;
DROP POLICY IF EXISTS "Users can insert sections to their courses" ON course_sections;
DROP POLICY IF EXISTS "Users can update sections of their courses" ON course_sections;
DROP POLICY IF EXISTS "Users can delete sections of their courses" ON course_sections;

CREATE POLICY "Users can view course sections of their courses" ON course_sections
    FOR SELECT USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert sections to their courses" ON course_sections
    FOR INSERT WITH CHECK (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update sections of their courses" ON course_sections
    FOR UPDATE USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete sections of their courses" ON course_sections
    FOR DELETE USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

-- RLS para section_content
ALTER TABLE section_content ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen para evitar errores
DROP POLICY IF EXISTS "Users can view content of their course sections" ON section_content;
DROP POLICY IF EXISTS "Users can insert content to their course sections" ON section_content;
DROP POLICY IF EXISTS "Users can update content of their course sections" ON section_content;
DROP POLICY IF EXISTS "Users can delete content of their course sections" ON section_content;

CREATE POLICY "Users can view content of their course sections" ON section_content
    FOR SELECT USING (
        section_id IN (
            SELECT cs.id FROM course_sections cs
            JOIN courses c ON c.id = cs.course_id
            WHERE c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert content to their course sections" ON section_content
    FOR INSERT WITH CHECK (
        section_id IN (
            SELECT cs.id FROM course_sections cs
            JOIN courses c ON c.id = cs.course_id
            WHERE c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update content of their course sections" ON section_content
    FOR UPDATE USING (
        section_id IN (
            SELECT cs.id FROM course_sections cs
            JOIN courses c ON c.id = cs.course_id
            WHERE c.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete content of their course sections" ON section_content
    FOR DELETE USING (
        section_id IN (
            SELECT cs.id FROM course_sections cs
            JOIN courses c ON c.id = cs.course_id
            WHERE c.created_by = auth.uid()
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at (solo si no existen)
DROP TRIGGER IF EXISTS update_course_sections_updated_at ON course_sections;
DROP TRIGGER IF EXISTS update_section_content_updated_at ON section_content;

CREATE TRIGGER update_course_sections_updated_at 
    BEFORE UPDATE ON course_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_content_updated_at 
    BEFORE UPDATE ON section_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
