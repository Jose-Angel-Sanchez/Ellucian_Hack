import { checkSuperUser } from "@/lib/utils/checkSuperUser"
import CourseEditForm from "@/components/courses/course-edit-form"

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const user = await checkSuperUser()
  const courseId = params.id

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Curso</h1>
        <CourseEditForm userId={user.id} courseId={courseId} />
      </div>
    </div>
  )
}
