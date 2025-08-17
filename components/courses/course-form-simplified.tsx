"use client"

import { useState } from "react"

export default function CourseFormSimplified({ 
  userId = "user-123",
  onCourseCreated 
}: { 
  userId?: string
  onCourseCreated?: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description || !category || !difficultyLevel || !estimatedDuration) {
      setMessage("Por favor completa todos los campos requeridos.")
      return
    }

    setIsLoading(true)
    setMessage("")
    
    try {
      // Simular creación de curso por ahora
      console.log("Creando curso:", {
        title,
        description,
        category,
        difficulty_level: difficultyLevel,
        estimated_duration: parseInt(estimatedDuration),
        created_by: userId,
      })

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMessage("✅ Curso creado correctamente! (Simulado)")
      
      // Llamar al callback si existe
      if (onCourseCreated) {
        onCourseCreated()
      }
      
      // Clear form
      setTitle("")
      setDescription("")
      setCategory("")
      setDifficultyLevel("")
      setEstimatedDuration("")
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("")
      }, 3000)

    } catch (error) {
      console.error("Error:", error)
      setMessage("❌ Error al crear el curso")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {message && (
        <div className={`p-3 rounded mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título del Curso *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Introducción a React"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el contenido del curso..."
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Selecciona una categoría</option>
              <option value="Programación">Programación</option>
              <option value="Diseño">Diseño</option>
              <option value="Marketing">Marketing</option>
              <option value="Negocios">Negocios</option>
              <option value="Datos">Análisis de Datos</option>
              <option value="IA">Inteligencia Artificial</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Dificultad *
            </label>
            <select
              id="difficulty"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Selecciona nivel</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Duración Estimada (minutos) *
          </label>
          <input
            type="number"
            id="duration"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 120"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white transition-colors`}
        >
          {isLoading ? "Creando..." : "Crear Curso"}
        </button>
      </form>
    </div>
  )
}
