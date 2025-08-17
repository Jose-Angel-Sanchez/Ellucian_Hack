import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { cache } from "react"

export type Database = {
  public: {
    Tables: {
      learning_paths: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_skills: string[] | null
          generated_by_ai: boolean
          path_data: any
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['learning_paths']['Row'], 'id' | 'created_at' | 'updated_at'>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          learning_path_id: string
          progress_percentage: number
          completed_sections: string[] | null
          time_spent: number
          last_accessed: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['user_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type DbClient = SupabaseClient<Database>

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(() => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: { message: "Supabase not configured" } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: { message: "Supabase not configured" } }),
      },
      from: () => ({
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        select: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        update: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      }),
    }
  }

  const cookieStore = cookies()
  
  // Create the client with cookie store
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore
  })
})
