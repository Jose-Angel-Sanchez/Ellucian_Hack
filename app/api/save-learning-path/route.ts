import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, learningPath } = body

    const supabase = createClient()

    // Save the learning path to the database
    const { data, error } = await supabase
      .from("learning_paths")
      .insert({
        user_id: userId,
        title: learningPath.title,
        description: learningPath.description,
        target_skills: learningPath.targetSkills,
        generated_by_ai: true,
        path_data: learningPath,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving learning path:", error)
      return NextResponse.json({ success: false, error: "Failed to save learning path" }, { status: 500 })
    }

    // Create progress entries for each course in the path
    const progressEntries = learningPath.courses.map((courseInfo: any) => ({
      user_id: userId,
      course_id: courseInfo.course.id,
      learning_path_id: data.id,
      progress_percentage: 0,
      status: "not_started",
    }))

    const { error: progressError } = await supabase.from("user_progress").insert(progressEntries)

    if (progressError) {
      console.error("Error creating progress entries:", progressError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      pathId: data.id,
    })
  } catch (error) {
    console.error("Error saving learning path:", error)
    return NextResponse.json({ success: false, error: "Failed to save learning path" }, { status: 500 })
  }
}
