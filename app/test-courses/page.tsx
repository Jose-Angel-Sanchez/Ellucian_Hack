import { createClient } from "@/lib/supabase/server"
import CoursesManagement from "@/components/courses/courses-management"
import AuthDebug from "@/components/debug/auth-debug"
import SessionDebug from "@/components/debug/session-debug"
import SessionSync from "@/components/debug/session-sync"
import ClientWrapper from "@/components/wrappers/client-wrapper"
import { redirect } from "next/navigation"

export default async function TestCoursesPage() {
  const supabase = createClient()
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <ClientWrapper initialUser={user}>
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800">
              <strong>🚀 Sistema Real:</strong> Conectado a Supabase con tabla courses creada
            </p>
            <p className="text-sm text-green-600 mt-1">
              Usuario: {user.email} (ID: {user.id})
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <SessionSync />
            <AuthDebug />
            <SessionDebug />
          </div>
          
          <CoursesManagement userId={user.id} />
        </div>
      </div>
    </ClientWrapper>
  )
}
