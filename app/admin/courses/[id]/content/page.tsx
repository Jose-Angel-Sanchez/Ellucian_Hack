import { checkSuperUser } from "../../../../../lib/utils/checkSuperUser"
import { createClient } from "../../../../../lib/supabase/server"
import { notFound } from "next/navigation"
import CourseSectionsManager from "../../../../../components/courses/course-sections-manager"

export default async function CourseContentPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const user = await checkSuperUser()
  const supabase = createClient()

  // Verificar que el curso existe y pertenece al usuario
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, description")
    .eq("id", params.id)
    .eq("created_by", user.id)
    .single()

  if (error || !course) {
    notFound()
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Contenido
          </h1>
          <h2 className="text-xl text-gray-600">
            {course.title}
          </h2>
          {course.description && (
            <p className="text-gray-500 mt-2">{course.description}</p>
          )}
        </div>

        <CourseSectionsManager courseId={course.id} />
      </div>
    </div>
  )
}
