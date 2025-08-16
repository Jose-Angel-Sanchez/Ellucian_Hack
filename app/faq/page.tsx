"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Send, Bot, HelpCircle, BookOpen, Users, Award } from "lucide-react"

const commonFAQs = [
  {
    id: "1",
    category: "General",
    question: "¿Cómo funciona la plataforma de aprendizaje con IA?",
    answer:
      "Nuestra plataforma utiliza inteligencia artificial para crear rutas de aprendizaje personalizadas basadas en tu nivel actual, objetivos y preferencias. El sistema analiza tu progreso y adapta el contenido para optimizar tu experiencia de aprendizaje.",
  },
  {
    id: "2",
    category: "Cursos",
    question: "¿Puedo acceder a los cursos desde cualquier dispositivo?",
    answer:
      "Sí, la plataforma está diseñada para ser completamente responsive. Puedes acceder desde computadoras, tablets y móviles con la misma experiencia de usuario optimizada.",
  },
  {
    id: "3",
    category: "Certificados",
    question: "¿Los certificados tienen validez oficial?",
    answer:
      "Nuestros certificados digitales incluyen un ID único de verificación y están respaldados por nuestra plataforma. Aunque no son títulos oficiales universitarios, son reconocidos en la industria como evidencia de competencias adquiridas.",
  },
  {
    id: "4",
    category: "Accesibilidad",
    question: "¿La plataforma es accesible para personas con discapacidades?",
    answer:
      "Absolutamente. Hemos implementado características de accesibilidad completas incluyendo navegación por teclado, soporte para lectores de pantalla, transcripciones de video, modo de alto contraste y ajustes de tamaño de texto.",
  },
  {
    id: "5",
    category: "Pagos",
    question: "¿Cómo funciona el modelo de pago único?",
    answer:
      "Ofrecemos un modelo de 'compra una vez, mantén para siempre'. Una vez que adquieres acceso a un curso o la plataforma completa, tienes acceso de por vida sin suscripciones recurrentes.",
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Todos")

  const categories = ["Todos", "General", "Cursos", "Certificados", "Accesibilidad", "Pagos"]

  const filteredFAQs = commonFAQs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai-faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: aiQuestion }),
      })

      const data = await response.json()
      setAiResponse(data.answer)
    } catch (error) {
      setAiResponse("Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Encuentra respuestas a las preguntas más comunes o pregúntale a nuestra IA especializada
        </p>
      </div>

      {/* AI Chat Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Asistente IA - Pregunta lo que necesites
          </CardTitle>
          <CardDescription>
            Nuestro asistente de IA puede responder preguntas específicas sobre la plataforma, cursos y aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Escribe tu pregunta aquí... Por ejemplo: '¿Cómo puedo crear una ruta de aprendizaje personalizada?'"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleAIQuestion}
              disabled={isLoading || !aiQuestion.trim()}
              size="lg"
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {aiResponse && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Bot className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <div className="font-medium text-primary">Respuesta de la IA:</div>
                    <p className="text-sm leading-relaxed">{aiResponse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bot className="w-4 h-4 animate-pulse" />
              <span>La IA está procesando tu pregunta...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar en las preguntas frecuentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Preguntas Frecuentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron preguntas que coincidan con tu búsqueda.</p>
              <p className="text-sm mt-2">Intenta con otros términos o pregúntale a nuestra IA.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Help Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Guía de Inicio</h3>
          <p className="text-sm text-muted-foreground">Aprende cómo usar la plataforma paso a paso</p>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Comunidad</h3>
          <p className="text-sm text-muted-foreground">Conecta con otros estudiantes y comparte experiencias</p>
        </Card>

        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Award className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Certificaciones</h3>
          <p className="text-sm text-muted-foreground">Información sobre certificados y validación</p>
        </Card>
      </div>
    </div>
  )
}
