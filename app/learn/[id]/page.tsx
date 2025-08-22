import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import LearningInterface from "@/components/learn/learning-interface"

interface LearnPageProps {
  params: {
    id: string
  }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch course details
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (error || !course) {
    notFound()
  }

  // Check if user is enrolled
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single()

  if (!userProgress) {
    redirect(`/courses/${course.id}`)
  }

  // Fetch linked content (via course_content -> content)
  const { data: linkedContent } = await supabase
    .from("course_content")
    .select("content:content(id, title, type, file_url, file_path, description, transcription, duration, created_at)")
    .eq("course_id", course.id)

  const contentItems = (linkedContent || [])
    .map((row: any) => row.content)
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      <LearningInterface course={course} userProgress={userProgress} userId={user.id} contentItems={contentItems} />
    </div>
  )
}
