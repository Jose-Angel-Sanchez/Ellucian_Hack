"use client"

import { AuthProvider } from "@/components/providers/auth-provider-enhanced"
import type { User } from "@supabase/supabase-js"

interface ClientWrapperProps {
  children: React.ReactNode
  initialUser?: User | null
}

export default function ClientWrapper({ children, initialUser }: ClientWrapperProps) {
  return (
    <AuthProvider initialUser={initialUser}>
      {children}
    </AuthProvider>
  )
}
