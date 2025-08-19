import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, Users, Star, Play, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import EnrollButton from "@/components/courses/enroll-button"

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch course details
  const { id } = await params
  const { data: course, error } = await ((supabase.from("courses") as any)
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single())

  if (error || !course) {
    notFound()
  }

  // Check if user is enrolled and get progress
  const { data: userProgress } = await ((supabase.from("user_progress") as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", id)
    .maybeSingle())

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Principiante"
      case "intermediate":
        return "Intermedio"
      case "advanced":
        return "Avanzado"
      default:
        return level
    }
  }

  const isEnrolled = !!userProgress
  const progressPercentage = userProgress?.progress_percentage || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navegación en navbar (hamburguesa en mobile) */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Badge className={getDifficultyColor(course.difficulty_level)}>
                  {getDifficultyLabel(course.difficulty_level)}
                </Badge>
                <Badge variant="secondary">{course.category}</Badge>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.floor(course.estimated_duration / 60)}h {course.estimated_duration % 60}m
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.content?.modules?.length || 0} módulos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>1,234 estudiantes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (156 reseñas)</span>
                </div>
              </div>

              {isEnrolled && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tu progreso</span>
                    <span className="text-sm text-gray-500">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-2xl">{isEnrolled ? "Continuar Aprendiendo" : "Comenzar Curso"}</CardTitle>
                  <CardDescription>
                    {isEnrolled ? `Has completado ${progressPercentage}% del curso` : "Únete a miles de estudiantes"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EnrollButton courseId={course.id} isEnrolled={isEnrolled} userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Lo que aprenderás</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.learning_objectives?.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos previos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prerequisite: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Modules */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido del curso</CardTitle>
                <CardDescription>
                  {course.content?.modules?.length || 0} módulos • {Math.floor(course.estimated_duration / 60)} horas de
                  contenido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.content?.modules?.map((module: any, moduleIndex: number) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">
                        Módulo {moduleIndex + 1}: {module.title}
                      </h3>
                      <div className="space-y-2">
                        {module.lessons?.map((lesson: any, lessonIndex: number) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                          >
                            <div className="flex items-center space-x-3">
                              <Play className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{lesson.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}min</span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type === "video"
                                  ? "Video"
                                  : lesson.type === "interactive"
                                    ? "Interactivo"
                                    : "Ejercicio"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas del curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estudiantes inscritos</span>
                    <span className="font-semibold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calificación promedio</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de finalización</span>
                    <span className="font-semibold">87%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
