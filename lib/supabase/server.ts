import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "./types"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(() => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase no está configurado correctamente. Verifica las variables de entorno.")
  }
  // Pre-fetch cookie store so the helper doesn't call cookies() directly
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
})
