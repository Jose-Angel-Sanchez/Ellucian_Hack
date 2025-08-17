import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("Received request to /api/save-learning-path")
  try {
    // Parse request body
    const body = await request.json().catch(() => {
      throw new Error("Invalid request body")
    })
    console.log("Request body parsed successfully")

    const { userId, learningPath } = body || {}

    if (!userId || !learningPath) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: userId and learningPath" },
        { status: 400 },
      )
    }

    if (!learningPath.title || !Array.isArray(learningPath.courses)) {
      return NextResponse.json(
        { success: false, error: "Learning path must have title and courses" },
        { status: 400 },
      )
    }

    const supabase = createClient() as any

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    if (user.id !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 403 })
    }

    // Save the learning path to the database
    const { data, error } = await supabase
      .from("learning_paths")
      .insert({
        user_id: userId,
        title: learningPath.title,
        description: learningPath.description || "",
        target_skills: learningPath.targetSkills || [],
        generated_by_ai: true,
        path_data: learningPath,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving learning path:", error)
      return NextResponse.json({ success: false, error: `Database error: ${error.message}` }, { status: 500 })
    }
    console.log("Learning path saved successfully")

    // Create progress entries if courses provided
    if (Array.isArray(learningPath.courses) && learningPath.courses.length > 0) {
      const progressEntries = learningPath.courses
        .filter((courseInfo: any) => courseInfo?.course?.id)
        .map((courseInfo: any) => ({
          user_id: userId,
          course_id: courseInfo.course.id,
          learning_path_id: data.id,
          progress_percentage: 0,
          status: "not_started",
        }))

      if (progressEntries.length > 0) {
        const { error: progressError } = await supabase.from("user_progress").insert(progressEntries)
        if (progressError) {
          console.error("Error creating progress entries:", progressError)
          // Non-fatal
        }
      }
    }

    console.log("Operation completed successfully")
    return NextResponse.json({
      success: true,
      pathId: data.id,
      message: "Learning path saved successfully",
    })

  } catch (error) {
    console.error("Error in /api/save-learning-path:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
