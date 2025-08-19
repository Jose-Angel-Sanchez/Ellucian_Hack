"use client"

import { useState } from "react"
import CourseFormMinimal from "./course-form-minimal"
// Removed inline created courses list per request

export default function CoursesManagement({ userId }: { userId: string }) {
  // Only course creation here

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h2>
      
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Crear Nuevo Curso</h3>
        <CourseFormMinimal userId={userId} />
      </div>
    </div>
  )
}
