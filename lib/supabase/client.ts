import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Factory function to create a new client instance in Client Components
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado correctamente. Verifica las variables de entorno.")
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    }
  )
}

// Optional: stabilize a singleton to avoid multiple GoTrueClient warnings
let singleton: ReturnType<typeof createClient> | null = null
export const supabaseClient = (): ReturnType<typeof createClient> => {
  if (!singleton) singleton = createClient()
  return singleton
}
