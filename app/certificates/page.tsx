import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CertificateGenerator } from "@/components/certificates/certificate-generator"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

export default async function CertificatesPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      *,
      courses!certificates_course_id_fkey(title, duration, skills)
    `)
    .eq("user_id", user.id)
    .order("completion_date", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Certificados</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver y descargar todos tus certificados de finalización de cursos.
        </p>
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="space-y-6">
          {certificates.map((certificate) => (
            <CertificateGenerator
              key={certificate.id}
              certificate={{
                id: certificate.id,
                user_name: user.user_metadata?.full_name || user.email || "Usuario",
                course_title: certificate.courses.title,
                completion_date: certificate.completion_date,
                certificate_id: certificate.certificate_id,
                course_duration: certificate.courses.duration || "No especificado",
                skills_learned: certificate.courses.skills || [],
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>No tienes certificados aún</CardTitle>
            <CardDescription>Completa tus primeros cursos para obtener certificados digitales</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
