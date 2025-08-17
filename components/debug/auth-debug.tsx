"use client"

import { useAuth } from "@/components/providers/auth-provider-enhanced"

export default function AuthDebug() {
  const { user, loading, refreshSession } = useAuth()

  if (loading) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-yellow-800">🔍 Verificando autenticación...</p>
      </div>
    )
  }

  const isAuthenticated = !!user

  return (
    <div className={`p-4 border rounded ${
      isAuthenticated 
        ? 'bg-green-100 border-green-300' 
        : 'bg-red-100 border-red-300'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold ${
          isAuthenticated ? 'text-green-800' : 'text-red-800'
        }`}>
          🔍 Estado de Autenticación (Contexto Mejorado)
        </h3>
        
        {!isAuthenticated && (
          <button
            onClick={refreshSession}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Refrescar Sesión
          </button>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <p>
          <strong>Estado:</strong> {isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}
        </p>
        
        {user && (
          <>
            <p><strong>ID:</strong> <code className="bg-gray-200 px-1 rounded">{user.id}</code></p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Creado:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </>
        )}
        
        {!user && !loading && (
          <div className="space-y-2">
            <p className="text-red-700">
              <strong>Problema:</strong> Sesión del servidor no se transfirió al cliente.
            </p>
            <p className="text-sm text-red-600">
              Haz clic en "🔄 Refrescar Sesión" o cierra/abre sesión nuevamente.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
