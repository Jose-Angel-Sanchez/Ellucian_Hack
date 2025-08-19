import { type SupabaseClient } from "@supabase/supabase-js"

const RETRY_DELAY = 150 // ms
const MAX_RETRIES = 2

export const withAuthRetry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await fn()
  } catch (err: any) {
    if (
      retries > 0 &&
      (err?.status === 429 || err?.code === "over_request_rate_limit")
    ) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY))
      return withAuthRetry(fn, retries - 1)
    }
    throw err
  }
}

export const getAuthUser = async (supabase: SupabaseClient) => {
  return withAuthRetry(() => supabase.auth.getUser())
}

export const getAuthSession = async (supabase: SupabaseClient) => {
  return withAuthRetry(() => supabase.auth.getSession())
}

export const getUserProfile = async (supabase: SupabaseClient, userId: string) => {
  return withAuthRetry(async () =>
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
  )
}

export const getCurrentUserAndProfile = async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error: authError,
  } = await getAuthUser(supabase)

  if (authError || !user) {
    throw new Error(authError?.message || "Authentication required")
  }

  const { data: profile, error: profileError } = await getUserProfile(supabase, user.id)

  if (profileError) {
    console.warn("Failed to load profile:", profileError.message)
  }

  return { user, profile }
}

export const getDisplayName = (user: any, profile?: any) => {
  return (
    (profile?.full_name && String(profile.full_name).trim()) ||
    (user.user_metadata?.username as string | undefined) ||
    (user.user_metadata?.user_name as string | undefined) ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : "Usuario")
  )
}
