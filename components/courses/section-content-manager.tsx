"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast-simple"
import { Plus, Edit2, Trash2, Save, X, Video, FileText, HelpCircle, Upload } from "lucide-react"

type ContentType = 'video' | 'text' | 'quiz' | 'file'

type SectionContent = {
  id: string
  section_id: string
  title: string
  content_type: ContentType
  content_data: any
  order_index: number
  is_required: boolean
  estimated_duration: number
}

const CONTENT_TYPES = [
  { value: 'text', label: 'Texto/Artículo', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'file', label: 'Archivo descargable', icon: Upload },
  { value: 'quiz', label: 'Quiz/Evaluación', icon: HelpCircle },
]

export default function SectionContentManager({ sectionId, sectionTitle }: { 
  sectionId: string
  sectionTitle: string 
}) {
  const [contents, setContents] = useState<SectionContent[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingContent, setEditingContent] = useState<string | null>(null)
  const [newContent, setNewContent] = useState({
    title: "",
    content_type: 'text' as ContentType,
    content_data: {},
    is_required: true,
    estimated_duration: 5
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Cargar contenido de la sección
  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("section_content")
        .select("*")
        .eq("section_id", sectionId)
        .order("order_index", { ascending: true })

      if (error) throw error
      setContents(data || [])
    } catch (error) {
      console.error("Error fetching content:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el contenido de la sección.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (sectionId) {
      fetchContent()
    }
  }, [sectionId])

  // Crear nuevo contenido
  const handleCreateContent = async () => {
    if (!newContent.title.trim()) {
      toast({
        title: "Error",
        description: "El título del contenido es requerido.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const nextOrder = contents.length + 1

      const { data, error } = await supabase
        .from("section_content")
        .insert({
          section_id: sectionId,
          title: newContent.title,
          content_type: newContent.content_type,
          content_data: getInitialContentData(newContent.content_type),
          order_index: nextOrder,
          is_required: newContent.is_required,
          estimated_duration: newContent.estimated_duration,
        })
        .select()
        .single()

      if (error) throw error

      setContents([...contents, data])
      setNewContent({
        title: "",
        content_type: 'text',
        content_data: {},
        is_required: true,
        estimated_duration: 5
      })
      setIsCreating(false)
      
      toast({
        title: "Contenido creado",
        description: "El contenido se ha agregado correctamente a la sección.",
      })
    } catch (error) {
      console.error("Error creating content:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el contenido.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener datos iniciales según el tipo de contenido
  const getInitialContentData = (type: ContentType) => {
    switch (type) {
      case 'text':
        return { content: '' }
      case 'video':
        return { url: '', description: '' }
      case 'file':
        return { file_url: '', file_name: '', file_size: 0 }
      case 'quiz':
        return { questions: [] }
      default:
        return {}
    }
  }

  // Eliminar contenido
  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este contenido?")) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from("section_content")
        .delete()
        .eq("id", contentId)

      if (error) throw error

      setContents(contents.filter(content => content.id !== contentId))
      
      toast({
        title: "Contenido eliminado",
        description: "El contenido se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener ícono del tipo de contenido
  const getContentIcon = (type: ContentType) => {
    const contentType = CONTENT_TYPES.find(ct => ct.value === type)
    const IconComponent = contentType?.icon || FileText
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-medium">Contenido: {sectionTitle}</h4>
        <Button 
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Contenido
        </Button>
      </div>

      {/* Formulario para crear nuevo contenido */}
      {isCreating && (
        <Card className="p-4">
          <div className="space-y-4">
            <Input
              placeholder="Título del contenido"
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de contenido</label>
                <Select 
                  value={newContent.content_type} 
                  onValueChange={(value: ContentType) => 
                    setNewContent({ ...newContent, content_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duración estimada (min)</label>
                <Input
                  type="number"
                  min="1"
                  value={newContent.estimated_duration}
                  onChange={(e) => setNewContent({ 
                    ...newContent, 
                    estimated_duration: parseInt(e.target.value) || 5 
                  })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_required"
                checked={newContent.is_required}
                onChange={(e) => setNewContent({ 
                  ...newContent, 
                  is_required: e.target.checked 
                })}
                className="rounded"
              />
              <label htmlFor="is_required" className="text-sm">
                Contenido obligatorio
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateContent} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Crear Contenido
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false)
                  setNewContent({
                    title: "",
                    content_type: 'text',
                    content_data: {},
                    is_required: true,
                    estimated_duration: 5
                  })
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de contenido */}
      <div className="space-y-3">
        {contents.map((content, index) => (
          <Card key={content.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 flex-1">
                {getContentIcon(content.content_type)}
                <div>
                  <h5 className="font-medium">
                    {index + 1}. {content.title}
                  </h5>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="capitalize">
                      {CONTENT_TYPES.find(t => t.value === content.content_type)?.label}
                    </span>
                    <span>{content.estimated_duration} min</span>
                    {content.is_required && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Obligatorio
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Aquí podrías abrir un modal o navegar a una página de edición
                    toast({
                      title: "Editar contenido",
                      description: "Función de edición en desarrollo.",
                    })
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteContent(content.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {contents.length === 0 && !isCreating && (
        <div className="text-center py-6 text-gray-500">
          <p>No hay contenido en esta sección.</p>
          <p className="text-sm">Agrega el primer contenido para empezar.</p>
        </div>
      )}
    </div>
  )
}
