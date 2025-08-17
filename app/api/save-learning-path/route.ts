import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("Received request to /api/save-learning-path")
  let supabase: any

  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      throw new Error("Invalid request body")
    }
    console.log("Request body parsed successfully")

    // Validate request body
    if (!body.userId || !body.learningPath) {
      console.error("Missing required fields in request")
      throw new Error("Missing required fields")
    }

    if (!body.learningPath.title || !body.learningPath.description || !Array.isArray(body.learningPath.courses)) {
      console.error("Invalid learning path data")
      throw new Error("Invalid learning path data")
    }

    // Initialize Supabase client
    supabase = createClient() as any

    console.log("Saving learning path to database...")
    // Save the learning path
    const { data, error } = await supabase
      .from("learning_paths")
      .insert({
        user_id: body.userId,
        title: body.learningPath.title,
        description: body.learningPath.description,
        target_skills: body.learningPath.targetSkills,
        generated_by_ai: true,
        path_data: body.learningPath,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving learning path:", error)
      throw new Error("Failed to save learning path")
    }
    console.log("Learning path saved successfully")

    // Create progress entries
    console.log("Creating progress entries...")
    const progressEntries = body.learningPath.courses.map((courseInfo: any) => ({
      user_id: body.userId,
      course_id: courseInfo.course.id,
      learning_path_id: data.id,
      progress_percentage: 0,
      status: "not_started",
    }))

    const { error: progressError } = await supabase
      .from("user_progress")
      .insert(progressEntries)

    if (progressError) {
      console.error("Error creating progress entries:", progressError)
      // Don't fail the request, just log the error
    } else {
      console.log("Progress entries created successfully")
    }

    console.log("Operation completed successfully")
    return NextResponse.json({
      success: true,
      pathId: data.id,
    })

  } catch (error) {
    console.error("Error in /api/save-learning-path:", error)
    
    // Determine appropriate error message and status
    let errorMessage = "An unexpected error occurred"
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}
