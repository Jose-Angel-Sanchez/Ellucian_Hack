import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Optional: restrict claiming to admins (same rule used elsewhere)
    if (!user.email?.includes('@alumno.buap.mx')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use admin client to bypass RLS and set ownership safely
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Server not configured for admin operations (missing SUPABASE_SERVICE_ROLE_KEY)' }, { status: 500 })
    }

    const { error } = await admin
      .from('courses')
      .update({ created_by: user.id })
      .is('created_by', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err?.message || String(err) }, { status: 500 })
  }
}
