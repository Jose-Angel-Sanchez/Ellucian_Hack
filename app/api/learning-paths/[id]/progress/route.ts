import { NextResponse, type NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient, type Database } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { computeRoadmapPercent } from "@/lib/roadmap/progress"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient() as SupabaseClient<Database>

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

  const { weekIndex, resourceIndex, completed, completeWeek } = body as {
    weekIndex: number
    resourceIndex?: number
    completed?: boolean
    completeWeek?: boolean
  }

  if (typeof weekIndex !== "number" || weekIndex < 0) {
    return NextResponse.json({ error: "Invalid weekIndex" }, { status: 400 })
  }

  const { data: path, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !path) {
    return NextResponse.json({ error: "Learning path not found" }, { status: 404 })
  }

  const pd = (path.path_data || {}) as any
  const roadmap = pd.roadmap || { weeks: [] }
  if (!Array.isArray(roadmap.weeks) || !roadmap.weeks[weekIndex]) {
    return NextResponse.json({ error: "Week not found" }, { status: 400 })
  }

  // Initialize shape
  roadmap.weeks[weekIndex].completed = completeWeek === true ? true : roadmap.weeks[weekIndex].completed || false
  roadmap.weeks[weekIndex].resources = Array.isArray(roadmap.weeks[weekIndex].resources)
    ? roadmap.weeks[weekIndex].resources
    : []

  if (typeof resourceIndex === "number") {
    if (!roadmap.weeks[weekIndex].resources[resourceIndex]) {
      return NextResponse.json({ error: "Resource not found" }, { status: 400 })
    }
    roadmap.weeks[weekIndex].resources[resourceIndex] = {
      ...roadmap.weeks[weekIndex].resources[resourceIndex],
      completed: completed === true,
    }
    // If all resources completed, mark week completed
    const allDone = roadmap.weeks[weekIndex].resources.every((r: any) => r.completed === true || r.type === "exercise")
    if (allDone) roadmap.weeks[weekIndex].completed = true
  }

  const { error: upErr } = await supabase
    .from("learning_paths")
    .update({ path_data: { ...pd, roadmap } })
    .eq("id", params.id)

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // Revalidate list and detail pages to reflect progress changes
  try {
    revalidatePath("/learning-paths")
    revalidatePath(`/learning-paths/${params.id}`)
  } catch {}

  // Optional: sync an aggregate progress entry per path by averaging existing rows
  try {
    const percent = computeRoadmapPercent(roadmap)
    // Update every user_progress row for this path to the same percent if lower
    const { data: rows } = await supabase
      .from("user_progress")
      .select("id, progress_percentage")
      .eq("user_id", user.id)
      .eq("learning_path_id", params.id)

    if (rows && rows.length > 0) {
      const updates = rows
        .filter((r: any) => (r.progress_percentage ?? 0) < percent)
        .map((r: any) => ({ id: r.id, progress_percentage: percent, status: percent >= 100 ? "completed" : "in_progress" }))
      if (updates.length > 0) {
        await supabase.from("user_progress").upsert(updates, { onConflict: "id" })
      }
    }
  } catch (_) {}

  return NextResponse.json({ success: true, roadmap })
}
