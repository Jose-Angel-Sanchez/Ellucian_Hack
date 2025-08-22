import { checkSuperUser } from "@/lib/utils/checkSuperUser"

export default async function StorageSetupPage() {
  await checkSuperUser()
  const resp = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/setup-storage`, { cache: 'no-store' }).catch(() => null)
  let body: any = null
  let ok = false
  try { body = await resp?.json() } catch {}
  ok = !!body?.ok
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Storage Setup</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(body || { error: 'No response' }, null, 2)}</pre>
      <div className={`mt-2 ${ok ? 'text-green-600' : 'text-red-600'}`}>{ok ? 'OK' : 'Failed'}</div>
    </div>
  )
}
