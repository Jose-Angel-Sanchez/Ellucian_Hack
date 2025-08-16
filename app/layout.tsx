import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AccessibilityToolbar from "@/components/accessibility/accessibility-toolbar"

const googleSansCode = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-google-sans-code",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "EduPath AI - Personalized Learning Platform",
  description:
    "AI-powered learning platform that creates personalized study paths based on your level and goals. Learn efficiently with adaptive content and accessibility features.",
  keywords: ["learning", "education", "AI", "personalized", "courses", "accessibility"],
  generator: "v0.app",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${googleSansCode.variable} ${inter.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#090225" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </head>
      <body className="font-sans bg-background text-text min-h-screen">
        <div id="skip-link" className="sr-only">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50"
          >
            Skip to main content
          </a>
        </div>

        <main id="main-content" role="main">
          {children}
        </main>

        <AccessibilityToolbar />

        <div id="live-region" aria-live="polite" aria-atomic="true" className="sr-only"></div>
      </body>
    </html>
  )
}
