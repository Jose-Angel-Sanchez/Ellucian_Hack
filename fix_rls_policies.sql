-- Actualizar políticas RLS para ser más flexibles
-- Ejecutar en Supabase SQL Editor

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can create their own courses" ON courses;
DROP POLICY IF EXISTS "Users can view their own courses" ON courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON courses;

-- Crear nuevas políticas más permisivas
CREATE POLICY "Users can create their own courses" ON courses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own courses" ON courses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own courses" ON courses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own courses" ON courses
    FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'courses';
