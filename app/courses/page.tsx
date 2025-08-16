import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Users, Star } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CoursesPage() {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch courses
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching courses:", error)
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Catálogo de Cursos</h1>
              <p className="text-gray-600 mt-2">Descubre cursos diseñados para tu nivel y objetivos</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Volver al Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap gap-4 mb-8">
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
            Todos
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
            Programación
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
            Diseño
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
            Marketing
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
            Tecnología
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
            Gestión
          </Badge>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(course.difficulty_level)}>
                    {getDifficultyLabel(course.difficulty_level)}
                  </Badge>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600 line-clamp-3">{course.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>1,234 estudiantes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary-hover text-white">Ver Curso</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!courses ||
          (courses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos disponibles</h3>
              <p className="text-gray-600">Los cursos aparecerán aquí una vez que estén disponibles.</p>
            </div>
          ))}
      </div>
    </div>
  )
}
