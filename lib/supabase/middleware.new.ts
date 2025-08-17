import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"
import { checkRateLimit, MAX_REQUESTS, RATE_LIMIT_WINDOW } from './rate-limit'

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  try {
    // Rate limit check using IP as identifier
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip, MAX_REQUESTS, RATE_LIMIT_WINDOW)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429 }
      )
    }

    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured, skipping auth middleware")
      return NextResponse.next()
    }

    // Create a response to modify
    const response = NextResponse.next()
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ 
      req: request, 
      res: response 
    })

    // Check for auth code in URL
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") || "/dashboard"

    if (code) {
      try {
        await supabase.auth.exchangeCodeForSession(code)
        return NextResponse.redirect(new URL(next, request.url))
      } catch (authError) {
        console.error("Error exchanging code for session:", authError)
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    }

    // Refresh session if needed
    const { data: { session } } = await supabase.auth.getSession()

    // Check if we need to protect this route
    const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
                           request.nextUrl.pathname.startsWith("/learning-paths") ||
                           request.nextUrl.pathname.startsWith("/courses")

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Return the response with updated cookies
    return response

  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}
