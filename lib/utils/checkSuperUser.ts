import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function checkSuperUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  const cookieStore = await cookies()
  const token = cookieStore.get("sb-iltamdcnvjwcmskvpjhw-auth-token")

  if (error || !user) {
    redirect("/auth/login")
  }

  // Verificar si el correo contiene @alumno.buap.mx
  if (!user.email?.includes("@alumno.buap.mx")) {
    redirect("/dashboard")
  }

  return user
}
