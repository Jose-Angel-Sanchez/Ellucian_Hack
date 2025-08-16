"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, Clock, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

interface LearningRecommendationsProps {
  userProgress: any[]
  profile: any
  courses: any[]
}

export default function LearningRecommendations({ userProgress, profile, courses }: LearningRecommendationsProps) {
  // Generate personalized recommendations based on user data
  const generateRecommendations = () => {
    const completedCategories = userProgress
      .filter((p) => p.status === "completed")
      .map((p) => p.courses?.category)
      .filter(Boolean)

    const inProgressCategories = userProgress
      .filter((p) => p.status === "in_progress")
      .map((p) => p.courses?.category)
      .filter(Boolean)

    const recommendations = [
      {
        type: "skill-gap",
        title: "Complementa tus Habilidades",
        description: "Basado en tus cursos completados, estos te ayudarán a especializarte más",
        courses: courses
          .filter((c) => completedCategories.includes(c.category) && !userProgress.some((p) => p.courses?.id === c.id))
          .slice(0, 2),
        icon: TrendingUp,
        color: "bg-blue-50 border-blue-200",
      },
      {
        type: "trending",
        title: "Tendencias Populares",
        description: "Cursos que otros estudiantes con tu perfil están tomando",
        courses: courses
          .filter((c) => c.category === "Tecnología" && !userProgress.some((p) => p.courses?.id === c.id))
          .slice(0, 2),
        icon: Star,
        color: "bg-yellow-50 border-yellow-200",
      },
      {
        type: "quick-wins",
        title: "Victorias Rápidas",
        description: "Cursos cortos para mantener tu momentum",
        courses: courses
          .filter((c) => c.estimated_duration < 300 && !userProgress.some((p) => p.courses?.id === c.id))
          .slice(0, 2),
        icon: Clock,
        color: "bg-green-50 border-green-200",
      },
    ]

    return recommendations.filter((r) => r.courses.length > 0)
  }

  const recommendations = generateRecommendations()

  // AI-powered insights
  const aiInsights = [
    {
      title: "Momento Ideal para Estudiar",
      description: "Basado en tu actividad, recomendamos estudiar entre 9:00-11:00 AM para máxima retención.",
      action: "Configurar Recordatorio",
      type: "schedule",
    },
    {
      title: "Próximo Hito",
      description: "Estás a solo 2 lecciones de completar tu curso actual. ¡Sigue así!",
      action: "Continuar Curso",
      type: "progress",
    },
    {
      title: "Nueva Ruta Sugerida",
      description: "Detectamos interés en IA. ¿Te gustaría una ruta personalizada en Machine Learning?",
      action: "Crear Ruta",
      type: "path",
    },
  ]

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Insights Personalizados</span>
          </CardTitle>
          <CardDescription>Recomendaciones basadas en tu progreso y patrones de aprendizaje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
                <Button size="sm" variant="outline" className="ml-4 bg-transparent">
                  {insight.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Recommendations */}
      {recommendations.map((recommendation, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <recommendation.icon className="h-5 w-5 text-primary" />
              <span>{recommendation.title}</span>
            </CardTitle>
            <CardDescription>{recommendation.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendation.courses.map((course) => (
                <div key={course.id} className={`p-4 rounded-lg border ${recommendation.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {course.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.difficulty_level === "beginner"
                            ? "Principiante"
                            : course.difficulty_level === "intermediate"
                              ? "Intermedio"
                              : "Avanzado"}
                        </Badge>
                        <span className="text-xs text-gray-500">{Math.floor(course.estimated_duration / 60)}h</span>
                      </div>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" className="ml-4">
                        Ver Curso
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Learning Path Suggestion */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>¿Listo para el Siguiente Nivel?</span>
          </CardTitle>
          <CardDescription>
            Basado en tu progreso, creemos que estás listo para una nueva ruta de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">Ruta Avanzada Sugerida</h4>
              <p className="text-sm text-gray-600">
                Especialízate en las áreas donde has mostrado más interés y progreso
              </p>
            </div>
            <Link href="/learning-paths/create">
              <Button className="bg-primary hover:bg-primary-hover text-white">
                Crear Ruta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
