    -- Crear tabla para el contenido
    CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'image', 'blog')),
    file_url TEXT,
    file_path TEXT,
    transcription TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Ensure required columns exist if table pre-existed without them
    ALTER TABLE content ADD COLUMN IF NOT EXISTS file_path TEXT;
    ALTER TABLE content ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

    -- Ensure RLS is enabled on content table
    ALTER TABLE content ENABLE ROW LEVEL SECURITY;
    -- Optional: enforce RLS for superusers as well
    -- ALTER TABLE content FORCE ROW LEVEL SECURITY;

    -- Crear bucket para almacenar los archivos
    INSERT INTO storage.buckets (id, name)
    VALUES ('content', 'content')
    ON CONFLICT DO NOTHING;

    -- Crear bucket para miniaturas de cursos
    INSERT INTO storage.buckets (id, name)
    VALUES ('courses', 'courses')
    ON CONFLICT DO NOTHING;

    -- Configurar políticas de almacenamiento para el bucket de contenido
    DROP POLICY IF EXISTS "Contenido accesible para todos" ON storage.objects;
    CREATE POLICY "Contenido accesible para todos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'content');

    DROP POLICY IF EXISTS "Solo superusuarios pueden subir contenido" ON storage.objects;
    CREATE POLICY "Solo superusuarios pueden subir contenido"
    ON storage.objects FOR INSERT
    WITH CHECK (
    bucket_id = 'content'
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    DROP POLICY IF EXISTS "Solo superusuarios pueden actualizar su contenido" ON storage.objects;
    CREATE POLICY "Solo superusuarios pueden actualizar su contenido"
    ON storage.objects FOR UPDATE
    USING (
    bucket_id = 'content'
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    DROP POLICY IF EXISTS "Solo superusuarios pueden eliminar su contenido" ON storage.objects;
    CREATE POLICY "Solo superusuarios pueden eliminar su contenido"
    ON storage.objects FOR DELETE
    USING (
    bucket_id = 'content'
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    -- Políticas para el bucket de cursos (thumbnails)
    DROP POLICY IF EXISTS "Cursos accesibles para todos" ON storage.objects;
    CREATE POLICY "Cursos accesibles para todos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'courses');

    DROP POLICY IF EXISTS "Solo superusuarios pueden subir archivos de cursos" ON storage.objects;
    CREATE POLICY "Solo superusuarios pueden subir archivos de cursos"
    ON storage.objects FOR INSERT
    WITH CHECK (
    bucket_id = 'courses'
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    DROP POLICY IF EXISTS "Solo superusuarios pueden actualizar archivos de cursos" ON storage.objects;
    CREATE POLICY "Solo superusuarios pueden actualizar archivos de cursos"
    ON storage.objects FOR UPDATE
    USING (
    bucket_id = 'courses'
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    DROP POLICY IF EXISTS "Solo superusuarios pueden eliminar archivos de cursos" ON storage.objects;
    CREATE POLICY "Solo superusuarios pueden eliminar archivos de cursos"
    ON storage.objects FOR DELETE
    USING (
    bucket_id = 'courses'
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    -- Configurar políticas de la tabla content
    DROP POLICY IF EXISTS "Contenido visible para todos" ON content;
    CREATE POLICY "Contenido visible para todos"
    ON content FOR SELECT
    USING (true);

    DROP POLICY IF EXISTS "Solo superusuarios pueden crear contenido" ON content;
    CREATE POLICY "Solo superusuarios pueden crear contenido"
    ON content FOR INSERT
    WITH CHECK (
    (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    DROP POLICY IF EXISTS "Solo superusuarios pueden actualizar su contenido" ON content;
    CREATE POLICY "Solo superusuarios pueden actualizar su contenido"
    ON content FOR UPDATE
    USING (
    created_by = auth.uid()
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );

    DROP POLICY IF EXISTS "Solo superusuarios pueden eliminar su contenido" ON content;
    CREATE POLICY "Solo superusuarios pueden eliminar su contenido"
    ON content FOR DELETE
    USING (
    created_by = auth.uid()
    AND (auth.jwt() ->> 'email' LIKE '%@alumno.buap.mx')
    );
