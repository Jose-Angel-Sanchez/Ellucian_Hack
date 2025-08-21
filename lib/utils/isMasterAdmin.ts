export function isMasterAdminEmail(email: string | null | undefined) {
  const master = process.env.MASTER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL
  if (!email || !master) return false
  return email.toLowerCase() === master.toLowerCase()
}
