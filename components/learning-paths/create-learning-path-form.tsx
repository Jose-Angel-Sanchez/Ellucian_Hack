"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, Target, Clock, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

interface CreateLearningPathFormProps {
  user: any
  profile: any
  courses: any[]
}

export default function CreateLearningPathForm({ user, profile, courses }: CreateLearningPathFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    goal: "",
    description: "",
    currentLevel: profile?.learning_level || "beginner",
    timeCommitment: "5-10",
    preferredCategories: [] as string[],
    specificSkills: "",
    learningStyle: "mixed",
  })
  const [generatedPath, setGeneratedPath] = useState<any>(null)
  const router = useRouter()

  const categories = [...new Set(courses.map((course) => course.category))]
  const learningStyles = [
    { value: "visual", label: "Visual (videos, diagramas)" },
    { value: "practical", label: "Práctico (ejercicios, proyectos)" },
    { value: "theoretical", label: "Teórico (lecturas, conceptos)" },
    { value: "mixed", label: "Mixto (combinación)" },
  ]

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter((c) => c !== category)
        : [...prev.preferredCategories, category],
    }))
  }

  const generateLearningPath = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/generate-learning-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          availableCourses: courses,
        }),
      })

      if (!response.ok) {
        throw new Error("Error generating learning path")
      }

      const result = await response.json()
      setGeneratedPath(result.learningPath)
    } catch (error) {
      console.error("Error generating learning path:", error)
      alert("Error al generar la ruta de aprendizaje. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const saveLearningPath = async () => {
    if (!generatedPath) return

    setLoading(true)

    try {
      const response = await fetch("/api/save-learning-path", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          learningPath: generatedPath,
        }),
      })

      if (!response.ok) {
        throw new Error("Error saving learning path")
      }

      const result = await response.json()
      router.push(`/learning-paths/${result.pathId}`)
    } catch (error) {
      console.error("Error saving learning path:", error)
      alert("Error al guardar la ruta de aprendizaje. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (generatedPath) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Ruta de Aprendizaje Generada</span>
            </CardTitle>
            <CardDescription>Tu ruta personalizada está lista. Revísala y guárdala para comenzar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{generatedPath.title}</h3>
                <p className="text-gray-600 mb-4">{generatedPath.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{generatedPath.estimatedDuration} semanas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{generatedPath.courses?.length || 0} cursos</span>
                  </div>
                  <Badge variant="secondary">{generatedPath.difficulty}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Cursos en tu ruta:</h4>
                <div className="space-y-3">
                  {generatedPath.courses?.map((courseInfo: any, index: number) => (
                    <div key={courseInfo.course.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{courseInfo.course.title}</h5>
                        <p className="text-sm text-gray-600">{courseInfo.reason}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {courseInfo.course.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {Math.floor(courseInfo.course.estimated_duration / 60)}h
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setGeneratedPath(null)}>
                  Generar Nueva Ruta
                </Button>
                <Button onClick={saveLearningPath} disabled={loading} className="bg-primary hover:bg-primary-hover">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar y Comenzar"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Cuéntanos sobre tus objetivos</span>
        </CardTitle>
        <CardDescription>
          Responde algunas preguntas para que nuestra IA pueda crear la ruta perfecta para ti
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="goal">¿Cuál es tu objetivo principal de aprendizaje?</Label>
          <Input
            id="goal"
            placeholder="Ej: Convertirme en desarrollador web, aprender marketing digital..."
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Describe más detalles sobre lo que quieres lograr</Label>
          <Textarea
            id="description"
            placeholder="Ej: Quiero crear mi propia página web, conseguir trabajo en marketing..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>¿Cuál es tu nivel actual?</Label>
            <Select
              value={formData.currentLevel}
              onValueChange={(value) => setFormData({ ...formData, currentLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante - Empezando desde cero</SelectItem>
                <SelectItem value="intermediate">Intermedio - Tengo conocimientos básicos</SelectItem>
                <SelectItem value="advanced">Avanzado - Quiero especializar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>¿Cuántas horas por semana puedes dedicar?</Label>
            <Select
              value={formData.timeCommitment}
              onValueChange={(value) => setFormData({ ...formData, timeCommitment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5">1-5 horas por semana</SelectItem>
                <SelectItem value="5-10">5-10 horas por semana</SelectItem>
                <SelectItem value="10-20">10-20 horas por semana</SelectItem>
                <SelectItem value="20+">Más de 20 horas por semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>¿Qué categorías te interesan más?</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={formData.preferredCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label htmlFor={category} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specificSkills">¿Hay habilidades específicas que quieres desarrollar?</Label>
          <Input
            id="specificSkills"
            placeholder="Ej: React, SEO, diseño UX, gestión de proyectos..."
            value={formData.specificSkills}
            onChange={(e) => setFormData({ ...formData, specificSkills: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>¿Cuál es tu estilo de aprendizaje preferido?</Label>
          <Select
            value={formData.learningStyle}
            onValueChange={(value) => setFormData({ ...formData, learningStyle: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {learningStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateLearningPath}
          disabled={loading || !formData.goal.trim()}
          className="w-full bg-primary hover:bg-primary-hover text-white"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando tu ruta personalizada...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generar Ruta con IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
