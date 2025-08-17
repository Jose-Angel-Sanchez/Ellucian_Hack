import { NextResponse, type NextRequest } from "next/server"
import { createClient, type Database } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient() as SupabaseClient<Database>

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Verify SSO user (auth.users.is_sso_user) using admin client
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured: missing service key" }, { status: 500 })
  }
  const { data: authUser, error: adminErr } = await admin.auth.admin.getUserById(user.id)
  if (adminErr || !authUser?.user) {
    return NextResponse.json({ error: "Could not verify user" }, { status: 403 })
  }
  const isSso = (authUser.user as any).is_sso_user === true
  if (!isSso) {
    return NextResponse.json({ error: "Only SSO users can upload videos" }, { status: 403 })
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const title = (formData.get("title") as string) || "Video"

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  // Upload to Supabase Storage bucket "videos"
  const filePath = `${params.id}/${Date.now()}-${file.name}`
  const { data: upload, error: uploadError } = await (supabase as any).storage
    .from("videos")
    .upload(filePath, file, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrl } = (supabase as any).storage.from("videos").getPublicUrl(filePath)

  // Append video resource to roadmap resources in path_data
  const { data: path, error: fetchError } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", params.id)
    .single()

  if (fetchError || !path) {
    return NextResponse.json({ error: "Learning path not found" }, { status: 404 })
  }
  // Ensure the uploader is the owner of the path
  if (path.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const pd = (path.path_data || {}) as any
  const newResource = { type: "video", title, url: publicUrl.publicUrl }
  const roadmap = pd.roadmap || { weeks: [] }
  // Put it into a misc resources bucket or week 1 if exists
  if (roadmap.weeks?.length) {
    roadmap.weeks[0].resources = Array.isArray(roadmap.weeks[0].resources)
      ? [...roadmap.weeks[0].resources, newResource]
      : [newResource]
  } else {
    roadmap.weeks = [{ title: "Semana 1", goals: [], resources: [newResource] }]
  }

  const { error: updateError } = await supabase
    .from("learning_paths")
    .update({ path_data: { ...pd, roadmap } })
    .eq("id", params.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, url: publicUrl.publicUrl })
}
