import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Award, TrendingUp, Play, Plus, Target } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/lib/actions"
import ProgressAnalytics from "@/components/dashboard/progress-analytics"
import LearningRecommendations from "@/components/dashboard/learning-recommendations"

export default async function DashboardPage() {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's enrolled courses with progress
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select(`
      *,
      courses (
        id,
        title,
        description,
        category,
        difficulty_level,
        estimated_duration
      )
    `)
    .eq("user_id", user.id)
    .order("last_accessed", { ascending: false })

  // Get recent courses for recommendations
  const { data: recentCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6)

  const completedCourses = userProgress?.filter((p) => p.status === "completed").length || 0
  const inProgressCourses = userProgress?.filter((p) => p.status === "in_progress").length || 0
  const totalTimeSpent = userProgress?.reduce((total, p) => total + (p.time_spent || 0), 0) || 0
  const averageProgress =
    userProgress?.length > 0
      ? Math.round(userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / userProgress.length)
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">¡Hola, {profile?.full_name || user.email}!</h1>
              <p className="text-gray-600 mt-1">Continúa tu viaje de aprendizaje</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/learning-paths">
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Mis Rutas
                </Button>
              </Link>
              <Link href="/courses">
                <Button className="bg-primary hover:bg-primary-hover text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Explorar Cursos
                </Button>
              </Link>
              <form action={signOut}>
                <Button variant="outline" type="submit">
                  Cerrar Sesión
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCourses}</div>
              <p className="text-xs text-muted-foreground">
                {completedCourses > 0 ? `+${Math.round(completedCourses * 0.2)} este mes` : "Completa tu primero"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCourses}</div>
              <p className="text-xs text-muted-foreground">Progreso promedio: {averageProgress}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(totalTimeSpent / 60)}h</div>
              <p className="text-xs text-muted-foreground">{Math.round(totalTimeSpent % 60)}min adicionales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Racha de Estudio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 días</div>
              <p className="text-xs text-muted-foreground">¡Récord personal!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Continúa Aprendiendo</h2>

              {userProgress && userProgress.length > 0 ? (
                <div className="space-y-4">
                  {userProgress.slice(0, 3).map((progress) => (
                    <Card key={progress.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{progress.courses?.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{progress.courses?.description}</p>
                            <div className="flex items-center space-x-4 mb-4">
                              <Badge variant="secondary">{progress.courses?.category}</Badge>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {Math.floor((progress.courses?.estimated_duration || 0) / 60)}h
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progreso</span>
                              <span className="text-sm text-gray-500">{progress.progress_percentage}%</span>
                            </div>
                            <Progress value={progress.progress_percentage} className="h-2" />
                          </div>
                          <div className="ml-6">
                            <Link href={`/learn/${progress.course_id}`}>
                              <Button className="bg-primary hover:bg-primary-hover text-white">
                                <Play className="h-4 w-4 mr-2" />
                                Continuar
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">¡Comienza tu primer curso!</h3>
                    <p className="text-gray-600 mb-4">Explora nuestro catálogo y encuentra el curso perfecto para ti</p>
                    <Link href="/courses">
                      <Button className="bg-primary hover:bg-primary-hover text-white">Explorar Cursos</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            <ProgressAnalytics userProgress={userProgress || []} profile={profile} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LearningRecommendations
              userProgress={userProgress || []}
              profile={profile}
              courses={recentCourses || []}
            />

            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Objetivos de Aprendizaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Meta semanal</span>
                      <span>5/7 días</span>
                    </div>
                    <Progress value={71} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Horas este mes</span>
                      <span>12/20 horas</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cursos este año</span>
                      <span>{completedCourses}/5 cursos</span>
                    </div>
                    <Progress value={(completedCourses / 5) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
