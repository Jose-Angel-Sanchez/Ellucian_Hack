import { redirect } from 'next/navigation'

export default function LegacyAdminEditCoursePage({ params }: { params: { id: string } }) {
  redirect(`/manage/${params.id}`)
}
