import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateLearningPathForm from "@/components/learning-paths/create-learning-path-form"

export default async function CreateLearningPathPage() {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile for personalization
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get available courses for path generation
  const { data: courses } = await supabase.from("courses").select("*").eq("is_active", true)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crear Ruta de Aprendizaje Personalizada</h1>
          <p className="text-gray-600 mt-2">
            Nuestra IA creará una ruta de aprendizaje adaptada a tus objetivos y nivel actual
          </p>
        </div>

        <CreateLearningPathForm user={user} profile={profile} courses={courses || []} />
      </div>
    </div>
  )
}
