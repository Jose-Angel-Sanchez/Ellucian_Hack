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

    // Limit to super users per current app rule
    if (!user.email?.includes("@alumno.buap.mx")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const form = await req.formData()
    const file = form.get("file") as File | null
    const type = (form.get("type") as string | null) || "misc"

    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    const admin = createAdminClient()
    if (!admin) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })

    // Build a namespaced path: {type}/{userId}/{timestamp}.{ext}
    const originalName = (file as any).name || "upload.bin"
    const ext = originalName.includes(".") ? originalName.split(".").pop() : undefined
    const filePath = `${type}/${user.id}/${Date.now()}${ext ? "." + ext : ""}`

    // Try upload; if bucket missing, create and retry once
    const tryUpload = async () => {
      return admin.storage
        .from("content")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: (file as any).type || undefined,
        })
    }

    let { error: uploadErr } = await tryUpload()
    if (uploadErr && String(uploadErr.message).toLowerCase().includes("bucket not found")) {
      // Ensure bucket exists and is public
      await admin.storage.createBucket("content", { public: true }).catch(() => {})
      await admin.storage.updateBucket("content", { public: true }).catch(() => {})
      // Retry once
      const retry = await tryUpload()
      uploadErr = retry.error
    }

    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 400 })

    const { data: pub } = admin.storage.from("content").getPublicUrl(filePath)

    return NextResponse.json({ file_path: filePath, public_url: pub?.publicUrl || null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
