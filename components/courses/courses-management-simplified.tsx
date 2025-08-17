"use client"

import { useState } from "react"
import CourseFormSimplified from "./course-form-simplified"
import CoursesListSimplified from "./courses-list-simplified"

export default function CoursesManagementSimplified({ userId }: { userId: string }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCourseCreated = () => {
    // Forzar refresco de la lista cuando se cree un curso
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Gestión de Cursos (Modo Demo)</h2>
        <p className="text-blue-700 text-sm">
          Esta es una versión simplificada que funciona sin Supabase. Para funcionalidad completa, configura las variables de entorno.
        </p>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Crear Nuevo Curso</h3>
          <CourseFormSimplified userId={userId} onCourseCreated={handleCourseCreated} />
        </div>

        <div className="bg-white border rounded-lg p-6">
          <CoursesListSimplified userId={userId} key={refreshKey} />
        </div>
      </div>
    </div>
  )
}
