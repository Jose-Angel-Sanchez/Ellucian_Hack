-- Verificar configuración de la tabla courses
SELECT 
    'courses' as tabla,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') 
         THEN '✅ Tabla existe' 
         ELSE '❌ Tabla no existe' 
    END as estado_tabla,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'courses') as politicas_rls;

-- Ver columnas de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;
