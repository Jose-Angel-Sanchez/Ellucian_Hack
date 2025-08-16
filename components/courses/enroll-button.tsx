"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Play, BookOpen } from "lucide-react"

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
  userId: string
}

export default function EnrollButton({ courseId, isEnrolled, userId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.from("user_progress").insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
        status: "in_progress",
      })

      if (error) {
        console.error("Error enrolling in course:", error)
        return
      }

      // Refresh the page to show updated enrollment status
      router.refresh()
    } catch (error) {
      console.error("Error enrolling in course:", error)
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
