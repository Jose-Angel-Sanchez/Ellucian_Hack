"use client"

import { useState } from "react"

type Course = {
  id: string
  title: string
  category: string
  difficulty_level: string
  estimated_duration: number
  is_active: boolean
  created_at: string
}

// Datos de ejemplo para mostrar el funcionamiento
const SAMPLE_COURSES: Course[] = [
  {
    id: "1",
    title: "Introducción a React",
    category: "Programación",
    difficulty_level: "beginner",
    estimated_duration: 120,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2", 
    title: "Diseño UI/UX Avanzado",
    category: "Diseño",
    difficulty_level: "intermediate",
    estimated_duration: 180,
    is_active: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
]

export default function CoursesListSimplified({ userId }: { userId: string }) {
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES)
  const [message, setMessage] = useState("")

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el curso "${title}"? Esta acción no se puede deshacer.`)) return

    try {
      // Simular eliminación
      setCourses(courses.filter((c) => c.id !== id))
      setMessage("✅ Curso eliminado correctamente (Simulado)")
      
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error al eliminar:", error)
      setMessage("❌ Error al eliminar el curso")
    }
  }

  const getDifficultyLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      beginner: "Principiante",
      intermediate: "Intermedio", 
      advanced: "Avanzado",
    }
    return labels[level] || level
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Mis Cursos</h3>
      
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-yellow-800 text-sm">
          <strong>Modo Demo:</strong> Estos son cursos de ejemplo. Configura Supabase para funcionalidad completa.
        </p>
      </div>
      
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">Aún no has creado ningún curso</p>
          <p className="text-sm text-gray-400">Crea tu primer curso usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-lg text-gray-900">{course.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {course.category}
                    </span>
                    <span>{getDifficultyLabel(course.difficulty_level)}</span>
                    <span>{formatDuration(course.estimated_duration)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      course.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {course.is_active ? "Activo" : "Borrador"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Creado: {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => alert("Funcionalidad de contenido en desarrollo")}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    📝 Contenido
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
