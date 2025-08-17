import { createClient } from '@/lib/supabase/server'
import ClientWrapper from '@/components/wrappers/client-wrapper'

async function getCourse(id: string) {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, category, difficulty_level, estimated_duration, created_by')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Course not found')
  // Optional: Enforce ownership on server (defense in depth)
  if (data.created_by !== user?.id) throw new Error('Not allowed')
  return { ...data }
}

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const course = await getCourse(params.id)
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ClientWrapper initialUser={user}>
      <div className="max-w-2xl mx-auto p-6 bg-white border rounded">
        <h1 className="text-xl font-semibold mb-4">Editar curso</h1>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            'use server'
          }}
        >
          {/* Client component will handle the form submission */}
        </form>
        <EditCourseClient course={course} />
      </div>
    </ClientWrapper>
  )
}

function EditCourseClient({ course }: { course: any }) {
  'use client'
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description)
  const [category, setCategory] = useState(course.category)
  const [difficulty, setDifficulty] = useState(course.difficulty_level)
  const [duration, setDuration] = useState(course.estimated_duration)
  const [message, setMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function save() {
    setIsSaving(true)
    setMessage('')
    try {
      const resp = await fetch(`/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty_level: difficulty,
          estimated_duration: duration,
        })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.error || resp.statusText)
      }
      setMessage('✅ Guardado')
      setTimeout(() => setMessage(''), 3000)
    } catch (e: any) {
      setMessage(`❌ ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  async function remove() {
    if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return
    setIsDeleting(true)
    setMessage('')
    try {
      const resp = await fetch(`/api/courses/${course.id}`, { method: 'DELETE' })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err?.error || resp.statusText)
      }
      window.location.href = '/test-courses'
    } catch (e: any) {
      setMessage(`❌ ${e.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className={`p-2 rounded ${message.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      <input className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full p-2 border rounded" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-3 gap-2">
        <input className="p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)} />
        <select className="p-2 border rounded" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="beginner">Principiante</option>
          <option value="intermediate">Intermedio</option>
          <option value="advanced">Avanzado</option>
        </select>
        <input type="number" className="p-2 border rounded" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      </div>
      <div className="flex gap-2">
        <button onClick={save} disabled={isSaving} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">💾 Guardar</button>
        <button onClick={remove} disabled={isDeleting} className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">🗑️ Eliminar</button>
      </div>
    </div>
  )
}

import { useState } from 'react'
