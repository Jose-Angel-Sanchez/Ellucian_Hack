import { createClient } from '@/lib/supabase/server'
import ClientWrapper from '@/components/wrappers/client-wrapper'
import EditCourseClient from '@/components/courses/edit-course-client'

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
        <EditCourseClient course={course} />
      </div>
    </ClientWrapper>
  )
}
