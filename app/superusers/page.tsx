import CourseRegister from "@/components/courses/course-register";
import { isSupabaseConfigured } from "@/lib/supabase/client";
const { randomBytes } = require('node:crypto');

export default function SuperuserPanelPage() {
    if (!isSupabaseConfigured) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-background">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
          </div>
        )
    }  


    return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-12 lg:px-56">
        <CourseRegister /> 
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-secondary text-white p-4">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">Imparte la aventura</h1>
          <p className="text-xl mb-8 opacity-90">Únete a miles de colaboradores en busca de un mejor futuro</p>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Evaluación inicial personalizada</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Contenido adaptado para su nivel</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Progreso en tiempo real</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}