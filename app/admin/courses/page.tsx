import { checkSuperUser } from "../../../lib/utils/checkSuperUser"
import CoursesManagementWrapper from "@/components/courses/courses-management-wrapper"

export default async function ManageCoursesPage() {
  const user = await checkSuperUser()

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Cursos</h1>
        <CoursesManagementWrapper userId={user.id} />
      </div>
    </div>
  )
}
