import { useState } from "react"

function useToast() {
  const [toasts, setToasts] = useState<any[]>([])

  const toast = ({ title, description, variant }: { 
    title?: string
    description?: string 
    variant?: "default" | "destructive"
  }) => {
    console.log("Toast:", { title, description, variant })
    // Simple implementation for now
  }

  return { toast, toasts }
}

export { useToast }
