'use client'
import CoursesManagement from './courses-management'

export default function CoursesManagementWrapper({ userId }: { userId: string }) {
  return <CoursesManagement userId={userId} />
}
