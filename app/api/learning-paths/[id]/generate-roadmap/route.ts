import { NextResponse, type NextRequest } from "next/server"
import { createClient, type Database } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { generateContent } from "@/lib/gemini/config"
import { revalidatePath } from "next/cache"
import { enrichRoadmap, type Roadmap } from "@/lib/roadmap/enrich"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient() as SupabaseClient<Database>

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Fetch the learning path to ensure ownership and gather context
  const { data: path, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !path) {
    return NextResponse.json({ error: "Learning path not found" }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const topic = body?.topic || path.title
  const skills = (path.target_skills || []).join(", ")

  const prompt = `Eres un instructor experto. Crea un roadmap detallado por semanas en formato JSON puro (sin markdown ni texto extra) para el tema: "${topic}".
  Requisitos:
  - Devuelve SOLO JSON válido.
  - Estructura exacta:
    {
      "weeks": [
        {
          "title": "Semana 1: ...",
          "goals": ["objetivo 1", "objetivo 2"],
          "resources": [
            { "type": "video", "title": "...", "url": "https://..." },
            { "type": "article", "title": "...", "url": "https://..." },
            { "type": "exercise", "title": "..." }
          ]
        }
      ]
    }
  - El campo "type" debe ser uno de: "video", "article", "exercise".
  - No uses comas finales ni claves sin comillas.
  - Si propones URLs, usa solo fuentes confiables (MDN, freeCodeCamp, React/Next.js docs, YouTube oficial, web.dev).
  Perfil: nivel ${path.path_data?.difficulty || "beginner"}, habilidades objetivo: ${skills}.`

  try {
    const text = await generateContent(prompt)

    // Helper to attempt robust JSON parsing
    const tryParse = (s: string) => {
      // strip code fences and language hints
      let cleaned = s.replace(/```json|```/g, "")
      // normalize quotes
      cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
      // remove trailing commas before ] or }
      cleaned = cleaned.replace(/,\s*(\]|\})/g, "$1")
      return JSON.parse(cleaned)
    }

  let roadmap: Roadmap | any
    try {
      roadmap = tryParse(text)
    } catch {
      // Try to extract first balanced JSON object
      const raw = text
      const start = raw.indexOf("{")
      if (start >= 0) {
        let depth = 0
        let end = -1
        let inStr = false
        let esc = false
        for (let i = start; i < raw.length; i++) {
          const ch = raw[i]
          if (inStr) {
            if (esc) { esc = false } else if (ch === '\\') { esc = true } else if (ch === '"') { inStr = false }
          } else {
            if (ch === '"') inStr = true
            else if (ch === '{') depth++
            else if (ch === '}') { depth--; if (depth === 0) { end = i; break } }
          }
        }
        if (end > start) {
          const fragment = raw.slice(start, end + 1)
          roadmap = tryParse(fragment)
        }
      }
      if (!roadmap) roadmap = { weeks: [] }

    // Enrich with curated real links and structurally complete content
    roadmap = enrichRoadmap(roadmap as Roadmap, topic)
    }

  const { error: updateError } = await supabase
      .from("learning_paths")
      .update({
        // store generated roadmap inside path_data
        path_data: { ...(path.path_data || {}), roadmap },
      })
      .eq("id", params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    try {
      revalidatePath("/learning-paths")
      revalidatePath(`/learning-paths/${params.id}`)
    } catch {}

    return NextResponse.json({ success: true, roadmap })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate roadmap"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
