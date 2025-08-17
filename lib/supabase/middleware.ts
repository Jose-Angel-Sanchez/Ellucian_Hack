import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/test-gemini",
  "/_next",
  "/favicon.ico",
]

export async function updateSession(request: NextRequest) {
  try {
    // Create a response to modify
    const response = NextResponse.next()
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ 
      req: request, 
      res: response 
    })

    // Refresh the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Check for auth code in URL
    const requestUrl = new URL(request.url)
    const authCode = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") || "/dashboard"

    // Handle OAuth callback
    if (authCode) {
      try {
        await supabase.auth.exchangeCodeForSession(authCode)
        return NextResponse.redirect(new URL(next, request.url))
      } catch (error) {
        console.error("Auth code exchange error:", error)
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith(route)
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
    // En caso de error, redirigir a login
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
}
