"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Award, Calendar, User, BookOpen } from "lucide-react"

interface Certificate {
  id: string
  user_name: string
  course_title: string
  completion_date: string
  certificate_id: string
  course_duration: string
  skills_learned: string[]
}

interface CertificateGeneratorProps {
  certificate: Certificate
}

export function CertificateGenerator({ certificate }: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificateId: certificate.id }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `certificate-${certificate.course_title.replace(/\s+/g, "-").toLowerCase()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">Certificado de Finalización</CardTitle>
        <CardDescription>Felicitaciones por completar exitosamente el curso</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Certificate Preview */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">CERTIFICADO DE FINALIZACIÓN</div>
            <div className="text-3xl font-bold text-primary">{certificate.course_title}</div>
            <div className="text-lg">
              Otorgado a <span className="font-semibold text-primary">{certificate.user_name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Por completar exitosamente el curso el {new Date(certificate.completion_date).toLocaleDateString("es-ES")}
            </div>
            <div className="text-xs text-muted-foreground">ID del Certificado: {certificate.certificate_id}</div>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Estudiante</div>
              <div className="text-sm text-muted-foreground">{certificate.user_name}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Curso</div>
              <div className="text-sm text-muted-foreground">{certificate.course_title}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Fecha de Finalización</div>
              <div className="text-sm text-muted-foreground">
                {new Date(certificate.completion_date).toLocaleDateString("es-ES")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">Duración</div>
              <div className="text-sm text-muted-foreground">{certificate.course_duration}</div>
            </div>
          </div>
        </div>

        {/* Skills Learned */}
        {certificate.skills_learned && certificate.skills_learned.length > 0 && (
          <div>
            <div className="font-medium mb-2">Habilidades Adquiridas</div>
            <div className="flex flex-wrap gap-2">
              {certificate.skills_learned.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Download Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? "Generando..." : "Descargar Certificado PDF"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
