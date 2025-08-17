import SuperloginForm from "@/components/auth/superlogin-form";
export default function SuperuserLoginPage() {
    
    return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center justify-center min-h-screen">
           <SuperloginForm />
        </div>

         {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-primary text-white p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">¡Bienvenido Contribuyente!</h1>
          <p className="text-xl mb-8 opacity-90">Continúa en la mision de llevar el aprendizaje al mundo</p>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Rutas de aprendizaje adaptativas</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Certificados digitales</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Accesibilidad completa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
}