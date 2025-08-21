import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient() as any
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Only super users can create via this endpoint
    if (!user.email?.includes("@alumno.buap.mx")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const {
      title,
      description,
      type,
      file_url,
      file_path,
      transcription,
      duration,
      course_ids,
    } = body || {}

    if (!title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json({ error: "Server misconfigured: missing service key" }, { status: 500 })
    }

    // Insert content
    const { data: inserted, error: insErr } = await admin
      .from("content")
      .insert({
        title,
        description,
        type,
        file_url,
        file_path,
        transcription,
        duration,
        created_by: user.id,
      })
      .select("id")
      .single()

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })

    const contentId = (inserted as any)?.id
    if (contentId && Array.isArray(course_ids) && course_ids.length > 0) {
      // Only allow linking to the caller's own courses
      const { data: allowedCourses, error: coursesErr } = await admin
        .from('courses')
        .select('id')
        .eq('created_by', user.id)
        .in('id', course_ids)

      if (coursesErr) return NextResponse.json({ error: coursesErr.message }, { status: 400 })

      const allowedIds = (allowedCourses || []).map((c: any) => c.id)
      if (allowedIds.length > 0) {
        const rows = allowedIds.map((cid: string) => ({ course_id: cid, content_id: contentId }))
        const { error: linkErr } = await admin.from("course_content").insert(rows)
        if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 400 })
      }
    }

    return NextResponse.json({ id: contentId }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
