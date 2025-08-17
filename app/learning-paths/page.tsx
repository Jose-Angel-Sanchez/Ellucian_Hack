import { createClient, type Database } from "@/lib/supabase/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, BookOpen, Target, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

type LearningPath = Database['public']['Tables']['learning_paths']['Row'] & {
  user_progress: Array<{
    progress_percentage: number
    status: string
    courses: {
      title: string
      category: string
    }
  }>
}

export default async function LearningPathsPage() {
  const supabase = createClient() as SupabaseClient<Database>
  let learningPaths: LearningPath[] = []

  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Authentication error:", authError)
      redirect("/auth/login")
    }

    if (!user) {
      redirect("/auth/login")
    }

    // Get user's learning paths with progress
    const { data: learningPathsData, error: fetchError } = await supabase
      .from("learning_paths")
      .select(`
        *,
        user_progress (
          progress_percentage,
          status,
          courses (
            title,
            category
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("Error fetching learning paths:", fetchError)
      throw new Error(`Failed to load learning paths: ${fetchError.message}`)
    }

    if (!learningPathsData) {
      console.error("No learning paths data returned")
      throw new Error("No learning paths data available")
    }

    learningPaths = learningPathsData as LearningPath[]
  } catch (error) {
    console.error("Error in learning paths page:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-red-800">Error Loading Learning Paths</h1>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const calculatePathProgress = (path: LearningPath) => {
    if (!path.user_progress || path.user_progress.length === 0) return 0
    const totalProgress = path.user_progress.reduce(
      (sum: number, progress) => sum + progress.progress_percentage,
      0,
    )
    return Math.round(totalProgress / path.user_progress.length)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada"
      case "active":
        return "Activa"
      case "paused":
        return "Pausada"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Rutas de Aprendizaje</h1>
              <p className="text-gray-600 mt-2">Rutas personalizadas creadas con IA para alcanzar tus objetivos</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Volver al Dashboard</Button>
              </Link>
              <Link href="/learning-paths/create">
                <Button className="bg-primary hover:bg-primary-hover text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Ruta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {learningPaths && learningPaths.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path: LearningPath) => {
              const progress = calculatePathProgress(path)
              const courseCount = path.path_data?.courses?.length || 0
              const estimatedDuration = path.path_data?.estimatedDuration || 0

              return (
                <Card key={path.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(path.status)}>{getStatusLabel(path.status)}</Badge>
                      {path.generated_by_ai && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Brain className="h-3 w-3" />
                          <span>IA</span>
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{path.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-3">{path.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{estimatedDuration} semanas</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{courseCount} cursos</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progreso</span>
                          <span className="text-sm text-gray-500">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {path.target_skills && path.target_skills.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Habilidades objetivo:</p>
                          <div className="flex flex-wrap gap-1">
                            {path.target_skills.slice(0, 3).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {path.target_skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{path.target_skills.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Link href={`/learning-paths/${path.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary-hover text-white">
                          {progress > 0 ? "Continuar Ruta" : "Comenzar Ruta"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-4">¡Crea tu primera ruta de aprendizaje!</h3>
              <p className="text-gray-600 mb-6">
                Nuestra IA analizará tus objetivos y creará una ruta personalizada con los cursos perfectos para ti.
              </p>
              <Link href="/learning-paths/create">
                <Button className="bg-primary hover:bg-primary-hover text-white" size="lg">
                  <Brain className="h-4 w-4 mr-2" />
                  Crear Ruta con IA
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
