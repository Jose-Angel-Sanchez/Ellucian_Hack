import { createClient } from "@/lib/supabase/server"
import CoursesManagement from "@/components/courses/courses-management"
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
          <CoursesManagement userId={user.id} />
        </div>
      </div>
    </ClientWrapper>
  )
}
