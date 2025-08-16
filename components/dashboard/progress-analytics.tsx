"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Target, Clock, Award, Flame, BookOpen } from "lucide-react"

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

  // Calculate learning streak (simulated)
  const currentStreak = 7
  const longestStreak = 14
  const weeklyGoal = 10 // hours
  const weeklyProgress = 7.5 // hours this week

  // Calculate completion rate trend
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0
  const isImproving = completionRate > 60 // Simulated trend

  // Recent achievements (simulated)
  const achievements = [
    {
      id: 1,
      title: "Primera Semana Completa",
      description: "7 días consecutivos de estudio",
      icon: Flame,
      earned: true,
    },
    { id: 2, title: "Curso Completado", description: "Terminaste tu primer curso", icon: Award, earned: true },
    { id: 3, title: "Estudiante Dedicado", description: "10 horas de estudio esta semana", icon: Clock, earned: false },
    {
      id: 4,
      title: "Explorador",
      description: "Inscrito en 3 cursos diferentes",
      icon: BookOpen,
      earned: inProgressCourses >= 3,
    },
  ]

  const earnedAchievements = achievements.filter((a) => a.earned)

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {isImproving ? "+5% desde la semana pasada" : "Mantén el ritmo"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} días</div>
            <p className="text-xs text-muted-foreground">Récord: {longestStreak} días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyProgress}h</div>
            <p className="text-xs text-muted-foreground">
              Meta: {weeklyGoal}h ({Math.round((weeklyProgress / weeklyGoal) * 100)}%)
            </p>
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

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Meta Semanal de Estudio</span>
          </CardTitle>
          <CardDescription>Progreso hacia tu objetivo de {weeklyGoal} horas esta semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm text-gray-500">
                {weeklyProgress}h / {weeklyGoal}h
              </span>
            </div>
            <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
            <div className="flex justify-between">
              {[1.5, 2, 1, 2.5, 0.5, 0, 0].map((hours, index) => (
                <div
                  key={index}
                  className={`w-8 h-16 rounded-sm ${hours > 0 ? "bg-primary" : "bg-gray-200"}`}
                  style={{ height: `${Math.max(hours * 8, 4)}px` }}
                  title={`${hours}h`}
                />
              ))}
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

      {/* Learning Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Patrones de Aprendizaje</CardTitle>
          <CardDescription>Insights sobre tus hábitos de estudio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Mejor Momento del Día</h4>
                <p className="text-xs text-gray-600">Eres más productivo por las mañanas</p>
              </div>
              <Badge variant="outline">9:00 - 11:00 AM</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Sesión Promedio</h4>
                <p className="text-xs text-gray-600">Duración ideal para mantener concentración</p>
              </div>
              <Badge variant="outline">45 minutos</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <h4 className="font-medium text-sm">Categoría Favorita</h4>
                <p className="text-xs text-gray-600">Donde más tiempo inviertes</p>
              </div>
              <Badge variant="outline">Programación</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
