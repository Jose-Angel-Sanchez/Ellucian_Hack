import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isMasterAdminEmail } from '@/lib/utils/isMasterAdmin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient() as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const master = isMasterAdminEmail(user.email)
    let query = supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (!master) {
      query = query.eq('created_by', user.id)
    }
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ courses: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 })
  }
}
