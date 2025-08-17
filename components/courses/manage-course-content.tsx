"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"

interface Section {
  id: string
  title: string
  description: string | null
  order_index: number
}

interface SectionItem {
  id: string
  title: string
  content_type: "video" | "audio" | "text" | "quiz" | "exercise"
  content: string
  order_index: number
}

export default function ManageCourseContent({ userId, courseId }: { userId: string; courseId: string }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [newSectionTitle, setNewSectionTitle] = useState("")

  const load = async () => {
    const { data, error } = await supabase
      .from("course_sections")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })
    if (error) {
      toast({ variant: "destructive", description: "No se pudieron cargar las secciones." })
    } else {
      setSections(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [courseId])

  const addSection = async () => {
    if (!newSectionTitle.trim()) return
    const nextIndex = (sections[sections.length - 1]?.order_index ?? 0) + 1
    const { data, error } = await supabase
      .from("course_sections")
      .insert({
        course_id: courseId,
        title: newSectionTitle.trim(),
        description: null,
        order_index: nextIndex,
      })
      .select("*")
      .single()
    if (error) {
      toast({ variant: "destructive", description: "No se pudo crear la sección." })
    } else {
      setSections([...sections, data])
      setNewSectionTitle("")
      toast({ description: "Sección creada." })
    }
  }

  const deleteSection = async (id: string) => {
    const { error } = await supabase
      .from("course_sections")
      .delete()
      .eq("id", id)
    if (error) {
      toast({ variant: "destructive", description: "No se pudo eliminar la sección." })
    } else {
      setSections(sections.filter((s) => s.id !== id))
      toast({ description: "Sección eliminada." })
    }
  }

  if (loading) return <div className="p-4 text-gray-500">Cargando...</div>

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="Nueva sección" />
        <Button onClick={addSection}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionEditor key={section.id} section={section} onDelete={() => deleteSection(section.id)} />
        ))}
      </div>
    </div>
  )
}

function SectionEditor({ section, onDelete }: { section: Section; onDelete: () => void }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [items, setItems] = useState<SectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState(section.title)

  const load = async () => {
    const { data, error } = await supabase
      .from("section_content")
      .select("*")
      .eq("section_id", section.id)
      .order("order_index", { ascending: true })
    if (error) {
      toast({ variant: "destructive", description: "No se pudo cargar el contenido." })
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [section.id])

  const saveTitle = async () => {
    const { error } = await supabase
      .from("course_sections")
      .update({ title })
      .eq("id", section.id)
    if (error) toast({ variant: "destructive", description: "No se pudo guardar la sección." })
    else toast({ description: "Sección actualizada." })
  }

  const addItem = async () => {
    const nextIndex = (items[items.length - 1]?.order_index ?? 0) + 1
    const { data, error } = await supabase
      .from("section_content")
      .insert({
        section_id: section.id,
        title: "Nuevo contenido",
        content_type: "text",
        content: "",
        order_index: nextIndex,
      })
      .select("*")
      .single()
    if (error) toast({ variant: "destructive", description: "No se pudo crear el contenido." })
    else setItems([...items, data])
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("section_content")
      .delete()
      .eq("id", id)
    if (error) toast({ variant: "destructive", description: "No se pudo eliminar el contenido." })
    else setItems(items.filter((i) => i.id !== id))
  }

  if (loading) return <div className="p-2 border rounded">Cargando sección...</div>

  return (
    <div className="p-4 border rounded space-y-3">
      <div className="flex items-center gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={saveTitle}>Guardar</Button>
        <Button variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Eliminar</Button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} onDelete={() => deleteItem(item.id)} />
        ))}
      </div>

      <Button onClick={addItem}><Plus className="h-4 w-4 mr-1" />Agregar contenido</Button>
    </div>
  )
}

function ItemRow({ item, onDelete }: { item: SectionItem; onDelete: () => void }) {
  const supabase = createClient()
  const { toast } = useToast()
  const [title, setTitle] = useState(item.title)
  const [content, setContent] = useState(item.content)

  const save = async () => {
    const { error } = await supabase
      .from("section_content")
      .update({ title, content })
      .eq("id", item.id)
    if (error) toast({ variant: "destructive", description: "No se pudo guardar el contenido." })
    else toast({ description: "Guardado." })
  }

  return (
    <div className="p-2 border rounded">
      <div className="grid grid-cols-2 gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <div className="flex gap-2 mt-2">
        <Button onClick={save}>Guardar</Button>
        <Button variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-1" />Eliminar</Button>
      </div>
    </div>
  )
}
