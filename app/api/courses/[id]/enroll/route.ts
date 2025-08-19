import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params
    const supabase = createClient() as any

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if course exists and is active
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('is_active', true)
      .maybeSingle()

    if (courseError) return NextResponse.json({ error: courseError.message }, { status: 400 })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    // Check existing enrollment
    const { data: existing, error: checkError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (checkError) return NextResponse.json({ error: checkError.message }, { status: 400 })
    if (existing) return NextResponse.json({ success: true, alreadyEnrolled: true })

    // Insert enrollment
    const { error: insertError } = await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        course_id: courseId,
        progress_percentage: 0,
        status: 'in_progress',
        completed_sections: [],
        time_spent: 0,
        last_accessed: new Date().toISOString(),
        learning_path_id: null,
      })

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 })
  }
}
