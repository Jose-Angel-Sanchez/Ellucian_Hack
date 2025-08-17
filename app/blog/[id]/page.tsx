import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User } from "lucide-react"
import { notFound } from "next/navigation"

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: post, error } = await ((supabase
    .from("content")
    .select("id, title, description, file_url, created_at, transcription") as any)
    .eq("id", params.id)
    .eq("type", "blog")
    .single())

  if (error || !post) notFound()

  const words = (post.description || "").split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <img
          src={post.file_url || "/placeholder.jpg"}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />

        <div className="flex items-center gap-2 mb-4">
          <Badge>Blog</Badge>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> Anónimo</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString("es-ES")}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {minutes} min</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-lg text-muted-foreground mb-8 whitespace-pre-wrap">{post.description}</p>

        {post.transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcripción</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{post.transcription}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
