"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  Clock,
  BookOpen,
  ArrowLeft,
  Volume2,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LearningInterfaceProps {
  course: any
  userProgress: any
  userId: string
}

export default function LearningInterface({ course, userProgress, userId }: LearningInterfaceProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<string[]>(userProgress.completed_sections || [])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(userProgress.progress_percentage || 0)
  const router = useRouter()
  const supabase = createClient()

  const modules = course.content?.modules || []
  const currentModule = modules[currentModuleIndex]
  const currentLesson = currentModule?.lessons?.[currentLessonIndex]

  // Calculate total lessons for progress
  const totalLessons = modules.reduce((total: number, module: any) => total + (module.lessons?.length || 0), 0)
  const completedCount = completedLessons.length

  useEffect(() => {
    // Update progress percentage
    const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    setProgress(newProgress)
  }, [completedCount, totalLessons])

  const updateProgress = async () => {
    try {
      const { error } = await supabase
        .from("user_progress")
        .update({
          progress_percentage: progress,
          completed_sections: completedLessons,
          last_accessed: new Date().toISOString(),
          time_spent: userProgress.time_spent + 1, // Increment time spent
          status: progress === 100 ? "completed" : "in_progress",
        })
        .eq("user_id", userId)
        .eq("course_id", course.id)

      if (error) {
        console.error("Error updating progress:", error)
      }
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const markLessonComplete = async () => {
    if (!currentLesson || completedLessons.includes(currentLesson.id)) return

    const newCompletedLessons = [...completedLessons, currentLesson.id]
    setCompletedLessons(newCompletedLessons)

    // Update database
    await updateProgress()
  }

  const goToNextLesson = () => {
    if (currentLessonIndex < (currentModule?.lessons?.length || 0) - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
    } else if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1)
      setCurrentLessonIndex(0)
    }
  }

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1)
      const prevModule = modules[currentModuleIndex - 1]
      setCurrentLessonIndex((prevModule?.lessons?.length || 1) - 1)
    }
  }

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "interactive":
        return <Settings className="h-4 w-4" />
      case "exercise":
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Video"
      case "interactive":
        return "Interactivo"
      case "exercise":
        return "Ejercicio"
      default:
        return "Contenido"
    }
  }

  if (!currentModule || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Curso no disponible</h2>
          <Link href="/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Course Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h2>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Progreso del curso</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="p-4">
          {modules.map((module: any, moduleIndex: number) => (
            <div key={module.id} className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">
                Módulo {moduleIndex + 1}: {module.title}
              </h3>
              <div className="space-y-2">
                {module.lessons?.map((lesson: any, lessonIndex: number) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentModuleIndex(moduleIndex)
                      setCurrentLessonIndex(lessonIndex)
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentModuleIndex === moduleIndex && currentLessonIndex === lessonIndex
                        ? "bg-primary text-white border-primary"
                        : completedLessons.includes(lesson.id)
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          getLessonTypeIcon(lesson.type)
                        )}
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.duration}min</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{getLessonTypeLabel(currentLesson.type)}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {currentLesson.duration} minutos
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={goToNextLesson}
                disabled={
                  currentModuleIndex === modules.length - 1 &&
                  currentLessonIndex === (currentModule?.lessons?.length || 0) - 1
                }
              >
                Siguiente
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-8 h-full flex items-center justify-center">
              {currentLesson.type === "video" && (
                <div className="w-full max-w-4xl">
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">{currentLesson.title}</h3>
                      <p className="text-gray-300">Contenido de video simulado</p>
                      <Button className="mt-4" onClick={() => setIsPlaying(!isPlaying)} variant="secondary">
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Reproducir
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600">Duración: {currentLesson.duration} minutos</span>
                    </div>
                    <Button onClick={markLessonComplete} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Completado
                    </Button>
                  </div>
                </div>
              )}

              {currentLesson.type === "interactive" && (
                <div className="w-full max-w-2xl text-center">
                  <div className="bg-blue-50 rounded-lg p-8 mb-6">
                    <Settings className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-xl font-semibold mb-4">{currentLesson.title}</h3>
                    <p className="text-gray-600 mb-6">
                      Contenido interactivo simulado - aquí irían ejercicios, quizzes o actividades prácticas.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <p className="text-left">
                          Pregunta de ejemplo: ¿Cuál es la diferencia entre let y var en JavaScript?
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline">Opción A</Button>
                        <Button variant="outline">Opción B</Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={markLessonComplete} className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completar Actividad
                  </Button>
                </div>
              )}

              {currentLesson.type === "exercise" && (
                <div className="w-full max-w-4xl">
                  <div className="bg-gray-50 rounded-lg p-8 mb-6">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-4 text-center">{currentLesson.title}</h3>
                    <div className="bg-white rounded border p-6">
                      <h4 className="font-medium mb-4">Ejercicio Práctico:</h4>
                      <p className="text-gray-600 mb-4">
                        Completa el siguiente ejercicio para poner en práctica lo que has aprendido.
                      </p>
                      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-4">
                        <div>// Escribe tu código aquí</div>
                        <div>function ejemplo() {`{`}</div>
                        <div className="ml-4">// Tu solución</div>
                        <div>{`}`}</div>
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline">Pista</Button>
                        <Button onClick={markLessonComplete} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enviar Solución
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
