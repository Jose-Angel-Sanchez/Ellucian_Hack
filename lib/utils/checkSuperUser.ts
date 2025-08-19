import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function checkSuperUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  // No direct cookie access needed; rely on Supabase session

  if (error || !user) {
    redirect("/auth/login")
  }

  // Verificar si el correo contiene @alumno.buap.mx
  if (!user.email?.includes("@alumno.buap.mx")) {
    redirect("/dashboard")
  }

  return user
}
