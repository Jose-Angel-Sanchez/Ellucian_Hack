"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SessionSync() {
  const [syncStatus, setSyncStatus] = useState<string>("🔄 Sincronizando...")
  
  useEffect(() => {
    const syncSession = async () => {
      try {
        const supabase = createClient()
        
        // Intentar múltiples métodos de autenticación
        setSyncStatus("🔄 Verificando sesión actual...")
        
        // Método 1: getSession
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (session) {
          setSyncStatus("✅ Sesión encontrada y sincronizada")
          return
        }
        
        setSyncStatus("🔄 Intentando refrescar token...")
        
        // Método 2: refreshSession
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshedSession) {
          setSyncStatus("✅ Token refrescado y sesión sincronizada")
          return
        }
        
        // Método 3: Verificar si hay tokens en localStorage
        setSyncStatus("🔄 Verificando localStorage...")
        
        const localStorageKeys = Object.keys(localStorage).filter(key => 
          key.includes('supabase') || key.includes('auth')
        )
        
        if (localStorageKeys.length > 0) {
          setSyncStatus(`⚠️ Tokens encontrados en localStorage: ${localStorageKeys.length}`)
          
          // Intentar restaurar desde localStorage
          for (const key of localStorageKeys) {
            const value = localStorage.getItem(key)
            if (value && value.includes('access_token')) {
              setSyncStatus("🔄 Intentando restaurar desde localStorage...")
              
              try {
                const parsed = JSON.parse(value)
                if (parsed.access_token) {
                  // Intentar setear la sesión manualmente
                  const { error: setError } = await supabase.auth.setSession({
                    access_token: parsed.access_token,
                    refresh_token: parsed.refresh_token
                  })
                  
                  if (!setError) {
                    setSyncStatus("✅ Sesión restaurada desde localStorage")
                    return
                  }
                }
              } catch (e) {
                console.log("Error parsing localStorage:", e)
              }
            }
          }
        }
        
        setSyncStatus("❌ No se pudo sincronizar la sesión")
        
      } catch (error) {
        console.error("Error en sincronización:", error)
        setSyncStatus(`❌ Error: ${error instanceof Error ? error.message : 'Desconocido'}`)
      }
    }
    
    syncSession()
  }, [])
  
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
      <strong>🔄 Sincronización de Sesión:</strong> {syncStatus}
    </div>
  )
}
