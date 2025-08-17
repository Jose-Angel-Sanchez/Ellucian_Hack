"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
]

export default function CourseEditForm({ userId, courseId }: { userId: string; courseId: string }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty_level: "",
    estimated_duration: 0,
  })
  const [durationInput, setDurationInput] = useState<string>("0")

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .eq("created_by", userId)
        .single()
      if (error || !data) {
        toast({ variant: "destructive", description: "No se pudo cargar el curso." })
      } else {
        const est = typeof data.estimated_duration === "number" && !Number.isNaN(data.estimated_duration)
          ? data.estimated_duration
          : 0
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          difficulty_level: data.difficulty_level || "",
          estimated_duration: est,
        })
        setDurationInput(String(est))
      }
      setLoading(false)
    }
    load()
  }, [courseId, userId])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Validar y convertir la duración
    const minutes = parseInt(durationInput.trim() || "0", 10)
    if (Number.isNaN(minutes) || minutes < 0) {
      toast({ variant: "destructive", description: "Duración inválida." })
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("courses")
      .update({
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty_level: form.difficulty_level,
        estimated_duration: minutes,
      })
      .eq("id", courseId)
      .eq("created_by", userId)

    if (error) {
      toast({ variant: "destructive", description: "No se pudo guardar el curso." })
    } else {
      toast({ description: "Curso actualizado." })
    }
    setSaving(false)
  }

  if (loading) return <div className="p-4 text-gray-500">Cargando...</div>

  return (
    <form onSubmit={save} className="space-y-4">
      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título" />
      <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" />
      <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categoría" />
      <Select value={form.difficulty_level} onValueChange={(v) => setForm({ ...form, difficulty_level: v })}>
        <SelectTrigger>
          <SelectValue placeholder="Nivel" />
        </SelectTrigger>
        <SelectContent>
          {DIFFICULTY_LEVELS.map((l) => (
            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={durationInput}
        onChange={(e) => setDurationInput(e.target.value)}
        placeholder="Duración (min)"
      />
      <Button disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}</Button>
    </form>
  )
}
