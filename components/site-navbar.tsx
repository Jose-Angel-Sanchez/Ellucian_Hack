"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions"
import { Brain, Menu } from "lucide-react"

interface SiteNavbarProps {
  user: { id: string; email?: string | null } | null
}

export default function SiteNavbar({ user }: SiteNavbarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 relative">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-7 w-7 text-primary" />
              <span className="text-xl font-semibold text-gray-900">inspiraT</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link href="/courses">
              <Button variant="ghost">Cursos</Button>
            </Link>
            <Link href="/learning-paths">
              <Button variant="ghost">Rutas</Button>
            </Link>
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <form action={signOut}>
                  <Button variant="outline" type="submit">Cerrar Sesión</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Ingresar</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-primary text-white">Registrarse</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-controls="mobile-menu"
              aria-expanded={open}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </button>
          </div>

          {/* Overlay */}
          {open && (
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
            />
          )}

          {/* Panel */}
          <div
            id="mobile-menu"
            className={`absolute right-4 top-14 bg-white border rounded-lg shadow-lg w-56 p-2 z-50 md:hidden ${
              open ? "block" : "hidden"
            }`}
          >
            <div className="flex flex-col gap-1">
              <Link href="/courses" className="w-full">
                <Button onClick={() => setOpen(false)} variant="ghost" className="w-full justify-start">Cursos</Button>
              </Link>
              <Link href="/learning-paths" className="w-full">
                <Button onClick={() => setOpen(false)} variant="ghost" className="w-full justify-start">Rutas</Button>
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full">
                    <Button onClick={() => setOpen(false)} variant="ghost" className="w-full justify-start">Dashboard</Button>
                  </Link>
                  <form action={signOut} className="w-full">
                    <Button onClick={() => setOpen(false)} variant="outline" type="submit" className="w-full justify-start">Cerrar Sesión</Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="w-full">
                    <Button onClick={() => setOpen(false)} variant="ghost" className="w-full justify-start">Ingresar</Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button onClick={() => setOpen(false)} className="w-full justify-start bg-primary text-white">Registrarse</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
