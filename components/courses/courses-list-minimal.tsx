"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider-enhanced"

type Course = {
  id: string
  title: string
  category: string
  difficulty_level: string
  estimated_duration: number
  is_active: boolean
  created_at: string
}

export default function CoursesListMinimal({ userId }: { userId: string }) {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const supabase = createClient()

  const fetchCourses = async () => {
    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("created_by", user.id) // Usar el ID del usuario del contexto
        .order("created_at", { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error("Error fetching courses:", error)
      setMessage("Error al cargar los cursos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCourses()
    }
  }, [user]) // Dependencia del usuario del contexto

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el curso "${title}"? Esta acción no se puede deshacer.`)) return

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id)

      if (error) throw error

      setCourses(courses.filter((c) => c.id !== id))
      setMessage("✅ Curso eliminado correctamente")
      
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

  if (loading) {
    return (
      <div className="p-4 border rounded">
        <p>Cargando cursos...</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Mis Cursos</h3>
      
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
                  <a
                    href={`/admin/courses/${course.id}/content`}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    📝 Contenido
                  </a>
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
