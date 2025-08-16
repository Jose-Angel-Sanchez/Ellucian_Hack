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

  return (
    <div className="min-h-screen bg-gray-50">
      <LearningInterface course={course} userProgress={userProgress} userId={user.id} />
    </div>
  )
}
