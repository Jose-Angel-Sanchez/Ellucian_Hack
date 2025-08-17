import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
  const supabase = createClient() as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { title, description, category, difficulty_level, estimated_duration } = body || {}

    if (!title || !description || !category || !difficulty_level || !estimated_duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        description,
        category,
        difficulty_level,
        estimated_duration: Number.parseInt(String(estimated_duration), 10),
        created_by: user.id,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message, details: error.details || null }, { status: 400 })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 })
  }
}
