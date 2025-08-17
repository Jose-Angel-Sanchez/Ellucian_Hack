import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"
import { withAuthRetry } from "./auth"

const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/test-gemini",
  "/_next",
  "/favicon.ico",
]

// In-memory cache with expiration
const cache = new Map<string, { value: any; expires: number }>()
const CACHE_TTL = 10000 // 10 seconds

const getFromCache = (key: string) => {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expires) {
    cache.delete(key)
    return null
  }
  return item.value
}

const setInCache = (key: string, value: any) => {
  cache.set(key, {
    value,
    expires: Date.now() + CACHE_TTL,
  })
}

const getAuthState = async (request: NextRequest) => {
  const cacheKey = request.cookies.get("supabase-auth-token")?.value
  if (cacheKey) {
    const cached = getFromCache(cacheKey)
    if (cached) return cached
  }

  // Create a response to modify
  const response = NextResponse.next()

  // Create the Supabase client
  const supabase = createMiddlewareClient({
    req: request,
    res: response,
  })

  // Get session with retry
  const { data: { session }, error: sessionError } = await withAuthRetry(() => 
    supabase.auth.getSession()
  )

  if (sessionError) {
    console.error("Session error:", sessionError)
    return { response: NextResponse.redirect(new URL("/auth/login", request.url)), session: null }
  }

  // Cache successful result
  if (cacheKey && session) {
    setInCache(cacheKey, { response, session })
  }

  return { response, session }
}

export async function updateSession(request: NextRequest) {
  try {
    const { response, session } = await getAuthState(request)

    // Check for auth code in URL
    const requestUrl = new URL(request.url)
    const authCode = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") || "/dashboard"

    // Handle OAuth callback
    if (authCode) {
      try {
        const supabase = createMiddlewareClient({
          req: request,
          res: response,
        })
        await supabase.auth.exchangeCodeForSession(authCode)
        return NextResponse.redirect(new URL(next, request.url))
      } catch (error) {
        console.error("Auth code exchange error:", error)
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(
      (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without session
    if (!isPublicRoute && !session) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Return the response with updated cookies
    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}
