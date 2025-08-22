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

    if (!user.email?.includes("@alumno.buap.mx")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { id, title, description, transcription } = body || {}
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

    // Ensure ownership
    const { data: record, error: getErr } = await admin
    .from("content")
    .select("id, created_by")
    .eq("id", id)
    .single()

    if (getErr || !record) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if ((record as any).created_by !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { error: updErr } = await admin
      .from("content")
      .update({
        title,
        description,
        transcription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
