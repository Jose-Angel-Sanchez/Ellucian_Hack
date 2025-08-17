"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    const emailAddr = data?.user?.email || data?.session?.user?.email || ""
    const isAdmin = !!emailAddr?.includes("@alumno.buap.mx")

    return { success: true, isAdmin }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const username = formData.get("username")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  if (!username) {
    return { error: "Username is required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

    // Primero verificamos si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toString())
      .single()

    if (existingUser) {
      return { error: "Este nombre de usuario ya está en uso" }
    }

    const { error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo: `${baseUrl}/dashboard`,
        data: {
          full_name: fullName?.toString() || "",
          username: username?.toString() || "",
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "¡Revisa tu correo para confirmar tu cuenta y comenzar a aprender!" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}
