import { checkSuperUser } from "../../../lib/utils/checkSuperUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import ContentUploader from "@/components/admin/content-uploader"
import ContentList from "@/components/admin/content-list"

export default async function AdminContentPage() {
  const user = await checkSuperUser()
  const supabase = createClient() as any

  // Load courses owned by this superuser to feed the global uploader
  const { data: myCourses } = await supabase
    .from('courses')
    .select('id, title, category, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Contenido</h1>

        {/* Global uploader con dropdown para seleccionar entre tus cursos */}
        <Card>
          <CardHeader>
            <CardTitle>Subir contenido y asignar a curso(s)</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentUploader
              userId={user.id}
              initialCourses={(myCourses || []).map((c: any) => ({ id: c.id, title: c.title }))}
            />
          </CardContent>
        </Card>

        {/* Content library (owned by this user) */}
        <Card>
          <CardHeader>
            <CardTitle>Mi biblioteca de contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentList userId={user.id} />
          </CardContent>
        </Card>

        {(!myCourses || myCourses.length === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>No tienes cursos propios aún</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Crea un curso para comenzar a asociar contenido multimedia.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
