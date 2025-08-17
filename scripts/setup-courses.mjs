import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  console.log('Verifica que .env.local contenga:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupCoursesTable() {
  console.log('🚀 Iniciando configuración de tabla de cursos...')

  try {
    // 1. Crear tabla de cursos si no existe
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100) NOT NULL,
          difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
          estimated_duration INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT false,
          created_by UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `

    console.log('📝 Creando tabla courses...')
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableQuery })
    if (tableError) {
      console.error('Error creando tabla:', tableError)
    } else {
      console.log('✅ Tabla courses creada/verificada')
    }

    // 2. Habilitar RLS
    console.log('🔒 Configurando Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE courses ENABLE ROW LEVEL SECURITY;' 
    })
    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.warn('RLS warning:', rlsError.message)
    } else {
      console.log('✅ RLS habilitado')
    }

    // 3. Crear políticas RLS
    const policies = [
      {
        name: 'courses_insert_policy',
        sql: `
          CREATE POLICY "Users can create their own courses" ON courses
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = created_by);
        `
      },
      {
        name: 'courses_select_policy', 
        sql: `
          CREATE POLICY "Users can view their own courses" ON courses
          FOR SELECT
          TO authenticated
          USING (auth.uid() = created_by);
        `
      },
      {
        name: 'courses_update_policy',
        sql: `
          CREATE POLICY "Users can update their own courses" ON courses
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = created_by);
        `
      },
      {
        name: 'courses_delete_policy',
        sql: `
          CREATE POLICY "Users can delete their own courses" ON courses
          FOR DELETE
          TO authenticated
          USING (auth.uid() = created_by);
        `
      }
    ]

    for (const policy of policies) {
      console.log(`📋 Creando política: ${policy.name}...`)
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.sql })
      if (policyError && !policyError.message.includes('already exists')) {
        console.warn(`Política ${policy.name} warning:`, policyError.message)
      } else {
        console.log(`✅ Política ${policy.name} creada`)
      }
    }

    // 4. Crear función para updated_at
    console.log('⚡ Creando función de trigger...')
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: triggerFunction })
    if (functionError) {
      console.warn('Function warning:', functionError.message)
    } else {
      console.log('✅ Función de trigger creada')
    }

    // 5. Crear trigger
    console.log('🔄 Creando trigger...')
    const triggerSql = `
      DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
      CREATE TRIGGER update_courses_updated_at
          BEFORE UPDATE ON courses
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSql })
    if (triggerError) {
      console.warn('Trigger warning:', triggerError.message)
    } else {
      console.log('✅ Trigger creado')
    }

    // Verificar configuración
    console.log('🔍 Verificando configuración...')
    const { data: tableCheck } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'courses')

    if (tableCheck && tableCheck.length > 0) {
      console.log('✅ Tabla courses verificada')
    }

    console.log('🎉 ¡Configuración de cursos completada exitosamente!')

  } catch (error) {
    console.error('❌ Error en la configuración:', error)
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (process.argv[1].includes('setup-courses.mjs')) {
  setupCoursesTable()
}
