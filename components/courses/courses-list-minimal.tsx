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
  const [hasOrphans, setHasOrphans] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ title: string; category: string; difficulty_level: string; estimated_duration: number; } | null>(null)
  const supabase = createClient()

  const fetchCourses = async () => {
    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Traer cursos del usuario y detectar huérfanos (created_by NULL)
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .or(`created_by.eq.${user.id},created_by.is.null`)
        .order("created_at", { ascending: false })

      if (error) throw error
      const list = data || []
      setCourses(list.filter(c => c.created_by === user.id))
      setHasOrphans(list.some(c => c.created_by === null))
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

  const claimOrphans = async () => {
    try {
      const resp = await fetch('/api/courses/orphans/claim', { method: 'POST' })
      if (!resp.ok) throw new Error('No se pudieron reclamar los cursos huérfanos')
      await fetchCourses()
      setMessage('✅ Cursos reclamados correctamente')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      console.error(e)
      setMessage('❌ Error al reclamar cursos huérfanos')
    }
  }

  const startEdit = (course: Course) => {
    setEditingId(course.id)
    setEditValues({
      title: course.title,
      category: course.category,
      difficulty_level: course.difficulty_level,
      estimated_duration: course.estimated_duration,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues(null)
  }

  const saveEdit = async (id: string) => {
    if (!editValues) return
    try {
      const resp = await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editValues.title,
          category: editValues.category,
          difficulty_level: editValues.difficulty_level,
          estimated_duration: Number.parseInt(String(editValues.estimated_duration), 10),
        })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.error || resp.statusText)
      }

      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...editValues } as Course : c))
      setMessage("✅ Curso actualizado correctamente")
      setTimeout(() => setMessage(""), 3000)
      cancelEdit()
    } catch (error) {
      console.error("Error al actualizar:", error)
      setMessage("❌ Error al actualizar el curso")
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el curso "${title}"? Esta acción no se puede deshacer.`)) return

    try {
      const resp = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.error || resp.statusText)
      }

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

      {hasOrphans && (
        <div className="p-3 rounded mb-4 bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-between">
          <span>Hay cursos existentes sin propietario. Puedes reclamarlos para administrarlos.</span>
          <button onClick={claimOrphans} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Reclamar</button>
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
                  {editingId === course.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full p-2 border rounded"
                        value={editValues?.title || ''}
                        onChange={(e) => setEditValues(v => ({ ...(v as any), title: e.target.value }))}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          className="p-2 border rounded"
                          value={editValues?.category || ''}
                          onChange={(e) => setEditValues(v => ({ ...(v as any), category: e.target.value }))}
                        />
                        <select
                          className="p-2 border rounded"
                          value={editValues?.difficulty_level || ''}
                          onChange={(e) => setEditValues(v => ({ ...(v as any), difficulty_level: e.target.value }))}
                        >
                          <option value="beginner">Principiante</option>
                          <option value="intermediate">Intermedio</option>
                          <option value="advanced">Avanzado</option>
                        </select>
                        <input
                          type="number"
                          className="p-2 border rounded"
                          value={editValues?.estimated_duration || 0}
                          onChange={(e) => setEditValues(v => ({ ...(v as any), estimated_duration: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <h4 className="font-medium text-lg text-gray-900">{course.title}</h4>
                  )}
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
                  {editingId === course.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(course.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        💾 Guardar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
                      >
                        ✖️ Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(course)}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      {/* Contenido action removed to keep inline management */}
                      <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
