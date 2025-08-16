"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface KeyboardNavigationProps {
  children: React.ReactNode
  className?: string
}

export default function KeyboardNavigation({ children, className = "" }: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]
      const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement)

      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault()
          const nextIndex = (currentIndex + 1) % focusableArray.length
          focusableArray[nextIndex]?.focus()
          break

        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault()
          const prevIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1
          focusableArray[prevIndex]?.focus()
          break

        case "Home":
          event.preventDefault()
          focusableArray[0]?.focus()
          break

        case "End":
          event.preventDefault()
          focusableArray[focusableArray.length - 1]?.focus()
          break

        case "Escape":
          ;(document.activeElement as HTMLElement)?.blur()
          break
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div ref={containerRef} className={className} role="navigation" aria-label="Navegación por teclado">
      {children}
    </div>
  )
}
