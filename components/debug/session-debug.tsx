"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SessionDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      
      try {
        // Verificar sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Verificar usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        setSessionInfo({
          session: session ? {
            access_token: session.access_token ? "✅ Presente" : "❌ Ausente",
            user_id: session.user?.id,
            expires_at: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : "No definido"
          } : null,
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          } : null,
          errors: {
            session: sessionError?.message || null,
            user: userError?.message || null
          }
        })
      } catch (err) {
        setSessionInfo({
          session: null,
          user: null,
          errors: {
            general: err instanceof Error ? err.message : "Error desconocido"
          }
        })
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-blue-100 border border-blue-300 rounded">
        <p className="text-blue-800">🔄 Verificando sesión...</p>
      </div>
    )
  }

  const hasSession = !!sessionInfo?.session
  const hasUser = !!sessionInfo?.user

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-semibold mb-3 text-gray-800">🔍 Debug de Sesión Supabase</h3>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        {/* Sesión */}
        <div className={`p-3 rounded ${hasSession ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
          <h4 className={`font-medium mb-2 ${hasSession ? 'text-green-800' : 'text-red-800'}`}>
            Sesión {hasSession ? '✅' : '❌'}
          </h4>
          {sessionInfo?.session ? (
            <div className="space-y-1">
              <p><strong>Token:</strong> {sessionInfo.session.access_token}</p>
              <p><strong>Usuario ID:</strong> <code className="bg-gray-200 px-1 rounded">{sessionInfo.session.user_id}</code></p>
              <p><strong>Expira:</strong> {sessionInfo.session.expires_at}</p>
            </div>
          ) : (
            <p className="text-red-700">No hay sesión activa</p>
          )}
        </div>

        {/* Usuario */}
        <div className={`p-3 rounded ${hasUser ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
          <h4 className={`font-medium mb-2 ${hasUser ? 'text-green-800' : 'text-red-800'}`}>
            Usuario {hasUser ? '✅' : '❌'}
          </h4>
          {sessionInfo?.user ? (
            <div className="space-y-1">
              <p><strong>ID:</strong> <code className="bg-gray-200 px-1 rounded">{sessionInfo.user.id}</code></p>
              <p><strong>Email:</strong> {sessionInfo.user.email}</p>
              <p><strong>Creado:</strong> {new Date(sessionInfo.user.created_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="text-red-700">No hay usuario autenticado</p>
          )}
        </div>
      </div>

      {/* Errores */}
      {(sessionInfo?.errors?.session || sessionInfo?.errors?.user || sessionInfo?.errors?.general) && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
          <h4 className="font-medium text-red-800 mb-2">⚠️ Errores encontrados:</h4>
          <div className="space-y-1 text-sm text-red-700">
            {sessionInfo.errors.session && <p><strong>Sesión:</strong> {sessionInfo.errors.session}</p>}
            {sessionInfo.errors.user && <p><strong>Usuario:</strong> {sessionInfo.errors.user}</p>}
            {sessionInfo.errors.general && <p><strong>General:</strong> {sessionInfo.errors.general}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
