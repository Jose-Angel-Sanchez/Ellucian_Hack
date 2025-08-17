"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CourseFormSimple({ userId }: { userId: string }) {
  const [title, setTitle] = useState("")

  return (
    <form className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold mb-4">Create Course (Simple)</h2>
        <Input
          placeholder="Course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit" className="w-full mt-4">
          Create Course
        </Button>
      </div>
    </form>
  )
}
