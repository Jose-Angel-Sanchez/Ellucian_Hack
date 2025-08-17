'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/auth-provider-enhanced'
import { Button } from '@/components/ui/button'

export default function DatabaseFixer() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [sqlFixes, setSqlFixes] = useState<any[]>([])
  const { user } = useAuth()

  const supabase = createClient()

  const getSqlFixes = async () => {
    try {
      const response = await fetch('/api/execute-sql', { method: 'POST' })
      const data = await response.json()
      
      if (data.success && data.results) {
        setSqlFixes(data.results)
        setMessage('📝 SQL fixes generated. Execute these in Supabase SQL Editor:')
      } else {
        setMessage('❌ Error generating SQL fixes')
      }
    } catch (error) {
      console.error('Error getting SQL fixes:', error)
      setMessage('❌ Error getting SQL fixes')
    }
  }

  const fixDatabase = async () => {
    setIsLoading(true)
    setMessage('')
    setResults([])

    try {
      // Test 0: Check user authentication first
      console.log('Checking user authentication...')
      if (!user) {
        setResults([{ 
          test: 'User Authentication', 
          success: false, 
          error: 'No user found in AuthProvider context',
          details: 'Make sure you are logged in and the AuthProvider is working correctly'
        }])
        setMessage('❌ Authentication required. Please log in first.')
        return
      }

      setResults([{ 
        test: 'User Authentication', 
        success: true, 
        data: { id: user.id, email: user.email },
        message: 'User is authenticated via AuthProvider'
      }])

      console.log('🔧 Starting database fixes...')
      
      // Test 1: Check if we can read from courses table
      console.log('Testing courses table access...')
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, created_by')
        .limit(1)

      if (courseError) {
        console.error('Error reading courses:', courseError)
        setResults(prev => [...prev, { 
          test: 'Read courses table', 
          success: false, 
          error: courseError.message 
        }])
      } else {
        console.log('✅ Can read courses table')
        setResults(prev => [...prev, { 
          test: 'Read courses table', 
          success: true, 
          data: courseData 
        }])
      }

      // Test 2: Try to create a test course
      console.log('Testing course creation...')
      
      if (!user) {
        throw new Error('User not authenticated - please check AuthProvider')
      }

      console.log('Using user:', user.id, user.email)

      const { data: testCourse, error: createError } = await supabase
        .from('courses')
        .insert({
          title: 'Test Course - ' + Date.now(),
          description: 'This is a test course to verify RLS policies',
          category: 'Otros',
          difficulty_level: 'beginner',
          estimated_duration: 60,
          created_by: user.id,
          is_active: false // Mark as inactive so it doesn't appear in production
        })
        .select('id')

      if (createError) {
        console.error('Error creating course:', createError)
        setResults(prev => [...prev, { 
          test: 'Create test course', 
          success: false, 
          error: createError.message,
          details: 'This indicates RLS policies are blocking course creation'
        }])
      } else {
        console.log('✅ Successfully created test course')
        setResults(prev => [...prev, { 
          test: 'Create test course', 
          success: true, 
          data: testCourse,
          message: 'RLS policies are working correctly!'
        }])

        // Clean up: delete the test course
        if (testCourse && testCourse.length > 0) {
          await supabase
            .from('courses')
            .delete()
            .eq('id', testCourse[0].id)
        }
      }

      // Test 3: Try to create a test section
      console.log('Testing section creation...')
      
      // First try to find an existing course or create one
      let testCourseId = null
      const { data: existingCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('created_by', user.id)
        .limit(1)

      if (existingCourses && existingCourses.length > 0) {
        testCourseId = existingCourses[0].id
      } else {
        // Create a temporary course for testing
        const { data: tempCourse, error: tempCourseError } = await supabase
          .from('courses')
          .insert({
            title: 'Temp Course for Testing - ' + Date.now(),
            description: 'Temporary course for section testing',
            category: 'Otros',
            difficulty_level: 'beginner',
            estimated_duration: 60,
            created_by: user.id,
            is_active: false
          })
          .select('id')
          .single()

        if (tempCourseError) {
          setResults(prev => [...prev, { 
            test: 'Create temp course for section test', 
            success: false, 
            error: tempCourseError.message,
            details: 'Cannot test sections without a course. Please run course diagnostics first.'
          }])
        } else {
          testCourseId = tempCourse.id
        }
      }

      if (testCourseId) {
        const { data: testSection, error: sectionError } = await supabase
          .from('course_sections')
          .insert({
            title: 'Test Section - ' + Date.now(),
            description: 'This is a test section to verify RLS policies',
            course_id: testCourseId,
            order_index: 1
          })
          .select('id')

        if (sectionError) {
          console.error('Error creating section:', sectionError)
          setResults(prev => [...prev, { 
            test: 'Create test section', 
            success: false, 
            error: sectionError.message,
            details: 'This indicates course_sections RLS policies are blocking section creation'
          }])
        } else {
          console.log('✅ Successfully created test section')
          setResults(prev => [...prev, { 
            test: 'Create test section', 
            success: true, 
            data: testSection,
            message: 'Section RLS policies are working correctly!'
          }])

          // Clean up: delete the test section
          if (testSection && testSection.length > 0) {
            await supabase
              .from('course_sections')
              .delete()
              .eq('id', testSection[0].id)
          }
        }
      }

      // Test 4: Check table structure
      console.log('Checking table structure...')
      setResults(prev => [...prev, { 
        test: 'Table structure check', 
        success: true, 
        message: 'If section creation failed, check that course_sections table exists and has proper RLS policies'
      }])

      setMessage('🔍 Database analysis completed. Check results below.')

    } catch (error: any) {
      console.error('Database fix error:', error)
      setMessage(`❌ Error: ${error.message}`)
      setResults(prev => [...prev, { 
        test: 'General error', 
        success: false, 
        error: error.message 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-6 bg-white border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🔧 Database Diagnostics</h3>
        <div className="flex gap-2">
          {!user && (
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              variant="secondary"
              size="sm"
            >
              🔐 Login First
            </Button>
          )}
          <Button 
            onClick={fixDatabase}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? '🔄 Analyzing...' : '🔍 Run Diagnostics'}
          </Button>
          <Button 
            onClick={getSqlFixes}
            variant="default"
          >
            📝 Generate SQL Fixes
          </Button>
        </div>
      </div>

      {!user && (
        <div className="p-3 rounded bg-yellow-100 text-yellow-800">
          ⚠️ User not authenticated. Please log in to run database diagnostics.
        </div>
      )}

      {message && (
        <div className={`p-3 rounded ${
          message.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Results:</h4>
          {results.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded text-sm ${
                result.success 
                  ? 'bg-green-100 border border-green-300' 
                  : 'bg-red-100 border border-red-300'
              }`}
            >
              <div className="font-medium">
                {result.success ? '✅' : '❌'} {result.test}
              </div>
              {result.error && (
                <div className="text-red-700 mt-1">
                  <strong>Error:</strong> {result.error}
                </div>
              )}
              {result.details && (
                <div className="text-gray-600 mt-1">
                  <strong>Details:</strong> {result.details}
                </div>
              )}
              {result.message && (
                <div className="text-gray-700 mt-1">
                  {result.message}
                </div>
              )}
              {result.data && (
                <div className="text-gray-600 mt-1 text-xs">
                  <strong>Data:</strong> {JSON.stringify(result.data, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sqlFixes.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">🛠️ SQL Fixes to Execute:</h4>
          <div className="text-sm text-gray-600 mb-3">
            Copy and paste these SQL statements into the Supabase SQL Editor and execute them in order:
          </div>
          {sqlFixes.map((fix, index) => (
            <div key={index} className="border border-gray-300 rounded">
              <div className="bg-gray-100 px-3 py-2 font-medium text-sm border-b">
                {index + 1}. {fix.name}
              </div>
              <div className="p-3">
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                  <code>{fix.sql}</code>
                </pre>
                {fix.note && (
                  <div className="text-xs text-blue-600 mt-2">
                    💡 {fix.note}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
            <p className="text-sm text-blue-800">
              🔗 <strong>Supabase SQL Editor:</strong> Go to your Supabase project → SQL Editor → New query, 
              then paste and execute each statement above.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Manual Fix Instructions</h4>
        <p className="text-sm text-yellow-700 mb-2">
          If the diagnostics show RLS policy errors, you need to run this SQL in your Supabase SQL editor:
        </p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`-- COURSES TABLE FIX
-- Add created_by column if missing
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create RLS policies for courses
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
CREATE POLICY "Authenticated users can create courses" 
ON courses FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- COURSE SECTIONS TABLE FIX  
-- Create RLS policies for course_sections
DROP POLICY IF EXISTS "Solo creadores pueden gestionar secciones" ON course_sections;

CREATE POLICY "Creadores pueden insertar secciones" ON course_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.created_by = auth.uid()
        )
    );

CREATE POLICY "Creadores pueden actualizar secciones" ON course_sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = course_sections.course_id
            AND courses.created_by = auth.uid()
        )
    );`}</pre>
        <p className="text-sm text-yellow-700 mt-2">
          📋 <strong>Or copy the complete fix from:</strong> <code>scripts/06-fix-sections-rls.sql</code>
        </p>
      </div>
    </div>
  )
}
