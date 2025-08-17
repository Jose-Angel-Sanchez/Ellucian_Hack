"use client"

import { useState } from "react"
import CourseFormMinimal from "./course-form-minimal"
import CoursesListMinimal from "./courses-list-minimal"

export default function CoursesManagement({ userId }: { userId: string }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCourseCreated = () => {
    // Forzar refresco de la lista cuando se cree un curso
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h2>
      
      <div className="grid gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Curso</h3>
          <CourseFormMinimal userId={userId} onCourseCreated={handleCourseCreated} />
        </div>

        <div className="bg-white border rounded-lg p-6">
          <CoursesListMinimal userId={userId} key={refreshKey} />
        </div>
      </div>
    </div>
  )
}
