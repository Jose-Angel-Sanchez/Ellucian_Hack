import { createClient, type Database } from "@/lib/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, BookOpen, ArrowLeft } from "lucide-react"

type LearningPathRow = Database["public"]["Tables"]["learning_paths"]["Row"]

export default async function LearningPathDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient() as SupabaseClient<Database>

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch path by ID and ensure it belongs to the user
  const { data: path, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single<LearningPathRow>()

  if (error || !path) {
    notFound()
  }

  // Gemini-generated data lives in path.path_data
  const data = (path.path_data || {}) as any
  const title: string = path.title || data.title || "Ruta de aprendizaje"
  const description: string = path.description || data.description || ""
  const difficulty: string = data.difficulty || "-"
  const estimatedDuration: number = data.estimatedDuration || 0
  const courses: Array<{ course: any; reason?: string }> = Array.isArray(data.courses) ? data.courses : []

  // Derive simple progress from count completed in future (placeholder 0 for now)
  const progress = 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Link href="/learning-paths">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Volver
              </Button>
            </Link>
            <Badge className="bg-blue-100 text-blue-800">{path.status}</Badge>
            {path.generated_by_ai && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>IA</span>
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">{title}</h1>
          {description && <p className="text-gray-600 mt-2 max-w-3xl">{description}</p>}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedDuration} semanas</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{courses.length} cursos</span>
            </div>
            <Badge variant="outline">{difficulty}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {courses.length > 0 ? (
              courses.map((ci, index) => (
                <Card key={ci.course?.id || index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                        {index + 1}
                      </span>
                      <span>{ci.course?.title || "Curso"}</span>
                    </CardTitle>
                    <CardDescription>
                      {ci.reason || "Seleccionado por la IA para tu objetivo"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {ci.course?.category && (
                        <Badge variant="outline" className="text-xs">
                          {ci.course.category}
                        </Badge>
                      )}
                      {typeof ci.course?.estimated_duration === "number" && (
                        <span>{Math.floor(ci.course.estimated_duration / 60)}h</span>
                      )}
                      {ci.course?.difficulty_level && <span>{ci.course.difficulty_level}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sin cursos</CardTitle>
                  <CardDescription>Esta ruta aún no contiene cursos.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progreso</CardTitle>
                <CardDescription>Tu avance en esta ruta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Completado</span>
                  <span className="text-sm text-gray-800">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="mt-4 flex gap-2">
                  <Link href="/learning-paths">
                    <Button variant="outline" className="w-full">Volver a Mis Rutas</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
