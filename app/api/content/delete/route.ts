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

    // only super users allowed
    if (!user.email?.includes("@alumno.buap.mx")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { id } = body || {}
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

    // Ensure record belongs to user, and get file_path for storage cleanup
    const { data: record, error: getErr } = await admin
      .from("content")
      .select("id, created_by, file_path")
      .eq("id", id)
      .single()

    if (getErr || !record) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (record.created_by !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Remove content links (if mapping table exists)
    await admin.from("course_content").delete().eq("content_id", id)

    // Delete DB record
    const { error: delErr } = await admin.from("content").delete().eq("id", id)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 })

    // Best-effort: delete storage file if any
    if ((record as any).file_path) {
      try {
        await admin.storage.from("content").remove([(record as any).file_path])
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
