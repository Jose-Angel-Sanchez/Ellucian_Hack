import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500 }
      )
    }

    const required = [
      { id: "content", public: true },
      { id: "courses", public: true },
    ]

    const { data: buckets, error: listErr } = await admin.storage.listBuckets()
    if (listErr) throw listErr

    const existing = new Set((buckets || []).map((b) => b.id))
    const results: any[] = []

    for (const b of required) {
      if (!existing.has(b.id)) {
        const { error } = await admin.storage.createBucket(b.id, { public: b.public })
        results.push({ bucket: b.id, created: true, updated: false, error: error?.message || null })
      } else {
        // Ensure public true
        const { error } = await admin.storage.updateBucket(b.id, { public: b.public })
        results.push({ bucket: b.id, created: false, updated: !error, error: error?.message || null })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 500 })
  }
}
