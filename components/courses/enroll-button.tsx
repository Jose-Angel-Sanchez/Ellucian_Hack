"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Play, BookOpen } from "lucide-react"
import { toast } from "sonner"

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
  userId: string
}

export default function EnrollButton({ courseId, isEnrolled, userId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEnroll = async () => {
    if (!userId || !courseId) {
      toast.error("Error: faltan datos requeridos")
      return
    }
    setLoading(true)

    try {
      // Call server route to handle enrollment under RLS
      const resp = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
      const payload = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        toast.error(payload?.error || 'Error al inscribirse')
        return
      }
      if (payload?.alreadyEnrolled) {
        toast.info('Ya estás inscrito en este curso')
        return
      }

      // Refresh the page to show updated enrollment status
  toast.success("¡Inscripción exitosa!")
      router.refresh()
    } catch (error) {
      console.warn("Error enrolling in course:", error)
      toast.error("Error inesperado al inscribirse")
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    // Navigate to course learning interface
    router.push(`/learn/${courseId}`)
  }

  if (isEnrolled) {
    return (
      <Button onClick={handleContinue} className="w-full bg-primary hover:bg-primary-hover text-white" size="lg">
        <Play className="h-4 w-4 mr-2" />
        Continuar Curso
      </Button>
    )
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full bg-secondary hover:bg-secondary-hover text-white"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Inscribiendo...
        </>
      ) : (
        <>
          <BookOpen className="h-4 w-4 mr-2" />
          Inscribirse Gratis
        </>
      )}
    </Button>
  )
}
