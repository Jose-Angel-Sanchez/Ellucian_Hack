import { createClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import fs from 'fs'
import path from 'path'

export async function initializeDatabase() {
  const supabase = createClient() as SupabaseClient<Database>
  
  try {
    // Read SQL scripts
    const sqlFunctionScript = fs.readFileSync(
      path.join(process.cwd(), 'scripts', '00-create-sql-function.sql'),
      'utf8'
    )

    const createTablesSQL = fs.readFileSync(
      path.join(process.cwd(), 'scripts', '01-create-tables.sql'),
      'utf8'
    )

    // First create the SQL function if it doesn't exist
    const { error: functionError } = await supabase.rpc('execute_sql_script', {
      sql_script: sqlFunctionScript
    })

    if (functionError && !functionError.message.includes('already exists')) {
      console.error('Error creating SQL function:', functionError)
      throw new Error(`Failed to create SQL execution function: ${functionError.message}`)
    }

    // Execute the table creation script
    const { error: tablesError } = await supabase.rpc('execute_sql_script', {
      sql_script: createTablesSQL
    })

    if (tablesError) {
      console.error('Error executing tables script:', tablesError)
      throw new Error(`Failed to create tables: ${tablesError.message}`)
    }

    // Verify that tables exist
    const requiredTables = ['learning_paths', 'user_progress', 'profiles', 'courses']
    const missingTables = []

    for (const table of requiredTables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('id')
        .limit(1)

      if (tableError) {
        console.error(`Error verifying table ${table}:`, tableError)
        missingTables.push(table)
      }
    }

    if (missingTables.length > 0) {
      throw new Error(
        `Database initialization incomplete. Missing tables: ${missingTables.join(', ')}`
      )
    }

    console.log('Database initialization successful')
    return {
      success: true,
      message: 'All required tables are present'
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
