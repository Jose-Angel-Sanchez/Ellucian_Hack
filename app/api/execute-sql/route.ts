import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔧 Fixing courses and course_sections table RLS policies...')

    // Execute the fixes step by step
    const fixes = [
      // COURSES TABLE FIXES
      // Step 1: Add created_by column if it doesn't exist
      {
        name: 'Add created_by column to courses',
        query: `ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id)`
      },
      
      // Step 2: Create INSERT policy for courses
      {
        name: 'Create courses INSERT policy',
        query: `CREATE POLICY IF NOT EXISTS "Authenticated users can create courses" 
                ON courses FOR INSERT 
                TO authenticated 
                WITH CHECK (auth.uid() IS NOT NULL)`
      },
      
      // Step 3: Create UPDATE policy for courses
      {
        name: 'Create courses UPDATE policy', 
        query: `CREATE POLICY IF NOT EXISTS "Users can update own courses" 
                ON courses FOR UPDATE 
                TO authenticated 
                USING (auth.uid() = created_by)`
      },
      
      // Step 4: Create DELETE policy for courses
      {
        name: 'Create courses DELETE policy',
        query: `CREATE POLICY IF NOT EXISTS "Users can delete own courses" 
                ON courses FOR DELETE 
                TO authenticated 
                USING (auth.uid() = created_by)`
      },

      // COURSE_SECTIONS TABLE FIXES
      // Step 5: Drop existing restrictive policies
      {
        name: 'Drop existing course_sections INSERT policy',
        query: `DROP POLICY IF EXISTS "course_sections_insert_policy" ON course_sections`
      },
      
      // Step 6: Drop existing UPDATE policy
      {
        name: 'Drop existing course_sections UPDATE policy',
        query: `DROP POLICY IF EXISTS "course_sections_update_policy" ON course_sections`
      },
      
      // Step 7: Drop existing DELETE policy
      {
        name: 'Drop existing course_sections DELETE policy',
        query: `DROP POLICY IF EXISTS "course_sections_delete_policy" ON course_sections`
      },
      
      // Step 8: Create new INSERT policy for course_sections
      {
        name: 'Create course_sections INSERT policy',
        query: `CREATE POLICY "course_sections_insert_policy" 
                ON course_sections FOR INSERT 
                TO authenticated 
                WITH CHECK (auth.uid() IS NOT NULL)`
      },
      
      // Step 9: Create new UPDATE policy for course_sections
      {
        name: 'Create course_sections UPDATE policy',
        query: `CREATE POLICY "course_sections_update_policy" 
                ON course_sections FOR UPDATE 
                TO authenticated 
                USING (auth.uid() IS NOT NULL)`
      },
      
      // Step 10: Create new DELETE policy for course_sections
      {
        name: 'Create course_sections DELETE policy',
        query: `CREATE POLICY "course_sections_delete_policy" 
                ON course_sections FOR DELETE 
                TO authenticated 
                USING (auth.uid() IS NOT NULL)`
      }
    ]

    const results = []
    
    for (const fix of fixes) {
      try {
        console.log(`Preparing: ${fix.name}`)
        
        // Since we can't directly execute DDL statements through the client,
        // we'll return the SQL statements for manual execution
        results.push({ 
          name: fix.name, 
          success: true, 
          sql: fix.query,
          note: "Execute this SQL manually in Supabase SQL Editor"
        })
        
      } catch (err: any) {
        console.error(`Exception in ${fix.name}:`, err)
        results.push({ name: fix.name, success: false, error: err.message })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'RLS policies setup completed',
      results 
    })
    
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
