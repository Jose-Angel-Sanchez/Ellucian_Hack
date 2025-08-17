"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Clock, Award, BookOpen } from "lucide-react"

interface ProgressAnalyticsProps {
  userProgress: any[]
  profile: any
}

export default function ProgressAnalytics({ userProgress, profile }: ProgressAnalyticsProps) {
  // Calculate analytics
  const totalCourses = userProgress.length
  const completedCourses = userProgress.filter((p) => p.status === "completed").length
  const inProgressCourses = userProgress.filter((p) => p.status === "in_progress").length
  const totalTimeSpent = userProgress.reduce((total, p) => total + (p.time_spent || 0), 0)
  const averageProgress =
    totalCourses > 0 ? Math.round(userProgress.reduce((sum, p) => sum + p.progress_percentage, 0) / totalCourses) : 0

  // Completion trend & rate
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
  const isImproving = completionRate >= 50

  // Achievements derived from real data
  const achievements = [
    { id: 2, title: "Primer Curso Completado", description: "Terminaste tu primer curso", icon: Award, earned: completedCourses >= 1 },
    { id: 5, title: "10 Horas de Estudio", description: "Has acumulado 10h de estudio", icon: Clock, earned: totalTimeSpent >= 600 },
    { id: 4, title: "Explorador", description: "Inscrito en 3 cursos diferentes", icon: BookOpen, earned: inProgressCourses >= 3 },
  ]

  const earnedAchievements = achievements.filter((a) => a.earned)

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
            {isImproving ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio de avance: {averageProgress}%
            </p>
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
            <CardTitle className="text-sm font-medium">Logros</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              {achievements.length - earnedAchievements.length} por desbloquear
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Patterns (real summaries) */}
      <Card>
        <CardHeader>
          <CardTitle>Patrones de Aprendizaje</CardTitle>
          <CardDescription>Resumen basado en tu actividad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Curso más avanzado</h4>
                <p className="text-xs text-gray-600">El de mayor % de progreso</p>
              </div>
              <Badge variant="outline">{
                (() => {
                  if (!userProgress?.length) return "N/A"
                  const top = [...userProgress].sort((a, b) => (b.progress_percentage||0) - (a.progress_percentage||0))[0]
                  return `${top?.courses?.title || 'N/A'} · ${top?.progress_percentage || 0}%`
                })()
              }</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Categoría más estudiada</h4>
                <p className="text-xs text-gray-600">Por tiempo acumulado</p>
              </div>
              <Badge variant="outline">{
                (() => {
                  const byCat: Record<string, number> = {}
                  userProgress.forEach(p => { const c=p.courses?.category; if (c) byCat[c]=(byCat[c]||0)+(p.time_spent||0) })
                  const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0]
                  return top ? `${top[0]}` : 'N/A'
                })()
              }</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Última actividad</h4>
                <p className="text-xs text-gray-600">Fecha del último acceso</p>
              </div>
              <Badge variant="outline">{
                (() => {
                  if (!userProgress?.length) return 'N/A'
                  const last = [...userProgress].sort((a,b)=> new Date(b.last_accessed).getTime()-new Date(a.last_accessed).getTime())[0]
                  const d = last?.last_accessed ? new Date(last.last_accessed) : null
                  return d ? d.toLocaleDateString() : 'N/A'
                })()
              }</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Logros Recientes</CardTitle>
          <CardDescription>Celebra tus hitos de aprendizaje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className={`p-2 rounded-full ${achievement.earned ? "bg-yellow-100" : "bg-gray-100"}`}>
                  <achievement.icon className={`h-4 w-4 ${achievement.earned ? "text-yellow-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <Badge variant="secondary" className="text-xs">
                    Desbloqueado
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      
    </div>
  )
}
