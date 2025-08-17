"use client"

interface SuperUserBadgeProps {
  user: { email?: string | null }
}

export default function SuperUserBadge({ user }: SuperUserBadgeProps) {
  const isSuperUser = user.email?.includes("@alumno.buap.mx")
  
  if (!isSuperUser) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-sm">
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      <span>Super Usuario BUAP</span>
      <span className="text-blue-100">⚡</span>
    </div>
  )
}
