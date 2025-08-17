import { checkSuperUser } from "../../../lib/utils/checkSuperUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminContentPage() {
  const user = await checkSuperUser()
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Contenido</h1>
        <Card>
          <CardHeader>
            <CardTitle>Subir Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Agregar ContentUploader y listado cuando estén disponibles */}
            <p className="text-gray-600">Próximamente: gestor de contenido.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
