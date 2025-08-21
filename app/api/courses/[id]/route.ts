import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isMasterAdminEmail } from '@/lib/utils/isMasterAdmin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient() as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const master = isMasterAdminEmail(user.email)

    // Fetch course to verify ownership when not master
    if (!master) {
      const { data: existing, error: fetchError } = await supabase.from('courses').select('id, created_by').eq('id', id).single()
      if (fetchError || !existing) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      if (existing.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json().catch(() => ({}))

  const { error } = await supabase
      .from('courses')
      .update({
        title: body.title,
        description: body.description,
        category: body.category,
        difficulty_level: body.difficulty_level,
        estimated_duration: body.estimated_duration != null ? Number.parseInt(String(body.estimated_duration), 10) : undefined,
    learning_objectives: Array.isArray(body.learning_objectives) ? body.learning_objectives : undefined,
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient() as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const master = isMasterAdminEmail(user.email)

    if (!master) {
      const { data: existing, error: fetchError } = await supabase.from('courses').select('id, created_by').eq('id', id).single()
      if (fetchError || !existing) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      if (existing.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 })
  }
}
