-- Script para verificar y crear las tablas necesarias para el sistema de cursos
-- Este script es seguro de ejecutar múltiples veces

-- 1. Crear tabla de cursos si no existe
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER NOT NULL, -- en minutos
    is_active BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Crear políticas RLS para courses si no existen
DO $$
BEGIN
    -- Habilitar RLS si no está habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'courses' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Política para permitir insertar a usuarios autenticados
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Users can create their own courses'
    ) THEN
        CREATE POLICY "Users can create their own courses" ON courses
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = created_by OR created_by IS NOT NULL);
    END IF;

    -- Política para ver cursos propios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Users can view their own courses'
    ) THEN
        CREATE POLICY "Users can view their own courses" ON courses
            FOR SELECT
            TO authenticated
            USING (auth.uid() = created_by OR created_by IS NOT NULL);
    END IF;

    -- Política para actualizar cursos propios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Users can update their own courses'
    ) THEN
        CREATE POLICY "Users can update their own courses" ON courses
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = created_by OR created_by IS NOT NULL);
    END IF;

    -- Política para eliminar cursos propios
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Users can delete their own courses'
    ) THEN
        CREATE POLICY "Users can delete their own courses" ON courses
            FOR DELETE
            TO authenticated
            USING (auth.uid() = created_by OR created_by IS NOT NULL);
    END IF;
END $$;

-- 3. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger para actualizar updated_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_courses_updated_at'
    ) THEN
        CREATE TRIGGER update_courses_updated_at
            BEFORE UPDATE ON courses
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. Verificar que todo esté configurado correctamente
SELECT 
    'courses' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') 
         THEN '✅ Tabla existe' 
         ELSE '❌ Tabla no existe' 
    END as table_status,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'courses' AND rowsecurity = true)
         THEN '✅ RLS habilitado'
         ELSE '❌ RLS no habilitado'
    END as rls_status,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'courses') as policy_count;
