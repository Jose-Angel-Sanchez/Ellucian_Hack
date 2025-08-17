import { createClient } from "./server"
import type { Database } from "./server"

async function createDatabaseFunction(supabase: any) {
  const functionSQL = `
    CREATE OR REPLACE FUNCTION get_table_info(table_schema text, table_names text[])
    RETURNS TABLE (table_name text) AS $$
    BEGIN
      RETURN QUERY
      SELECT t.table_name::text
      FROM information_schema.tables t
      WHERE t.table_schema = table_schema
      AND t.table_name = ANY(table_names)
      AND t.table_type = 'BASE TABLE';
    END;
    $$ LANGUAGE plpgsql;
  `
  
  await supabase.rpc('exec_sql', { sql: functionSQL })
}

export async function checkDatabaseTables() {
  const supabase = createClient() as any
  
  try {
    // Verificar si las tablas existen mediante una consulta raw
    const { data, error } = await supabase
      .rpc('get_table_info', {
        table_schema: 'public',
        table_names: ['learning_paths', 'user_progress', 'profiles', 'courses']
      })

    if (error) {
      console.error("Error checking tables:", error)
      // Si el error es porque la función no existe, la creamos
      if (error.code === 'PGRST700') {
        await createDatabaseFunction(supabase)
        // Intentar de nuevo después de crear la función
        const retry = await supabase.rpc('get_table_info', {
          table_schema: 'public',
          table_names: ['learning_paths', 'user_progress', 'profiles', 'courses']
        })
        if (retry.error) {
          throw retry.error
        }
        return {
          learningPathsExists: retry.data.includes('learning_paths'),
          userProgressExists: retry.data.includes('user_progress'),
          error: null
        }
      }
      throw error
    }

    return {
      learningPathsExists: data.includes('learning_paths'),
      userProgressExists: data.includes('user_progress'),
      error: null
    }
  } catch (error: any) {
    console.error("Database check failed:", error)
    
    // Si el error es porque la función RPC no existe, intentamos verificar directamente
    if (error.code === 'PGRST700' || (error.message && (error.message.includes('function') || error.message.includes('relation')))) {
      try {
        const { data: learningPathsData } = await supabase
          .from('learning_paths')
          .select('id')
          .limit(1)
        
        const { data: userProgressData } = await supabase
          .from('user_progress')
          .select('id')
          .limit(1)

        return {
          learningPathsExists: learningPathsData !== null,
          userProgressExists: userProgressData !== null,
          error: null
        }
      } catch (directError: any) {
        console.error("Error in direct table check:", directError)
        return {
          learningPathsExists: false,
          userProgressExists: false,
          error: directError.message
        }
      }
    }

    return {
      learningPathsExists: false,
      userProgressExists: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}
