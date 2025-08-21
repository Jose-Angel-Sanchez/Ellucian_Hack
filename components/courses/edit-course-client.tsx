"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditCourseClient({ course }: { course: any }) {
  const router = useRouter()
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [category, setCategory] = useState(course.category)
  const [difficulty, setDifficulty] = useState(course.difficulty_level)
  const [duration, setDuration] = useState(course.estimated_duration)
  const [learningObjectivesText, setLearningObjectivesText] = useState(
    Array.isArray(course.learning_objectives) ? course.learning_objectives.join('\n') : ''
  )
  const [message, setMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const learning_objectives = learningObjectivesText
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean)

      const resp = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty_level: difficulty,
          estimated_duration: Number(duration),
          learning_objectives,
        }),
      })

      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.message || resp.statusText)
      }

  setMessage('✅ Curso actualizado correctamente')
  setTimeout(() => router.push('/manage'), 1000)
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas ocultar este curso?')) return
    
    setIsDeleting(true)
    try {
      const resp = await fetch(`/api/courses/${course.id}`, { method: 'DELETE' })
      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.message || resp.statusText)
      }
  setMessage('✅ Curso ocultado correctamente')
  setTimeout(() => router.push('/manage'), 1000)
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block mb-1">Lo que aprenderás (una por línea)</label>
          <textarea
            value={learningObjectivesText}
            onChange={(e) => setLearningObjectivesText(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder={"Ejemplo:\n- Comprender fundamentos\n- Construir un proyecto real"}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Dificultad</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Duración (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar cambios
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            {isDeleting ? 'Ocultando...' : 'Ocultar curso'}
          </button>
        </div>
      </form>
    </div>
  )
}
