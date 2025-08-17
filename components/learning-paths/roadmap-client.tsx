"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type RoadmapWeek = {
  title?: string
  goals?: string[]
  completed?: boolean
  resources?: Array<{ title?: string; url?: string; type?: string; completed?: boolean }>
}

type Roadmap = { weeks: RoadmapWeek[] }

export default function RoadmapClient({
  pathId,
  initialRoadmap,
  courses,
}: {
  pathId: string
  initialRoadmap: Roadmap
  courses: Array<{ course: any; reason?: string }>
}) {
  const router = useRouter()
  const [weeks, setWeeks] = React.useState<RoadmapWeek[]>(initialRoadmap?.weeks ?? [])
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [typingText, setTypingText] = React.useState("")
  const [updating, setUpdating] = React.useState(false)

  // simple typing animation while waiting
  React.useEffect(() => {
    if (!isGenerating) return
    const message = "Generando roadmap con IA… "
    let i = 0
    const id = setInterval(() => {
      setTypingText(message.slice(0, (i % (message.length + 10)) + 1))
      i += 1
    }, 60)
    return () => clearInterval(id)
  }, [isGenerating])

  async function onGenerate() {
    try {
      setIsGenerating(true)
      setTypingText("")

      const res = await fetch(`/api/learning-paths/${pathId}/generate-roadmap`, {
        method: "POST",
      })
      if (!res.ok) {
        const msg = await safeGetError(res)
        throw new Error(msg)
      }
      const json = await res.json().catch(() => ({ success: true }))
      const roadmap: Roadmap = (json?.roadmap && Array.isArray(json.roadmap.weeks))
        ? json.roadmap
        : await refetchRoadmap()

      // animate reveal: add weeks progressively
      setWeeks([])
      for (let i = 0; i < (roadmap.weeks?.length ?? 0); i++) {
        await sleep(180)
        setWeeks(prev => [...prev, roadmap.weeks[i]])
      }

      // keep server state in sync
      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert(e?.message || "No se pudo generar el roadmap")
    } finally {
      setIsGenerating(false)
      setTypingText("")
    }
  }

  async function refetchRoadmap(): Promise<Roadmap> {
    // As a fallback, re-fetch the page's data via a lean API if needed in future
    // For now, return current weeks to avoid UI break
    return { weeks }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Button onClick={onGenerate} variant="secondary" disabled={isGenerating}>
          {isGenerating ? "Generando…" : "Generar Roadmap (IA)"}
        </Button>
        {isGenerating && (
          <span className="text-sm text-gray-500 whitespace-pre">{typingText}</span>
        )}
      </div>

      {weeks.length > 0 ? (
        weeks.map((w, idx) => (
          <AnimatedWeekCard
            key={idx}
            week={w}
            index={idx}
            onToggleResource={async (ri, completed) => {
              try {
                setUpdating(true)
                const res = await fetch(`/api/learning-paths/${pathId}/progress`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ weekIndex: idx, resourceIndex: ri, completed }),
                })
                if (!res.ok) throw new Error((await res.json()).error || "Error actualizando progreso")
                const j = await res.json()
                if (j?.roadmap?.weeks) setWeeks(j.roadmap.weeks)
                // Refresh to update server-rendered Progress meter
                router.refresh()
              } catch (e: any) {
                alert(e?.message || "No se pudo actualizar el progreso")
              } finally {
                setUpdating(false)
              }
            }}
            onCompleteWeek={async () => {
              try {
                setUpdating(true)
                const res = await fetch(`/api/learning-paths/${pathId}/progress`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ weekIndex: idx, completeWeek: true }),
                })
                if (!res.ok) throw new Error((await res.json()).error || "Error actualizando semana")
                const j = await res.json()
                if (j?.roadmap?.weeks) setWeeks(j.roadmap.weeks)
                // Refresh to update server-rendered Progress meter
                router.refresh()
              } catch (e: any) {
                alert(e?.message || "No se pudo completar la semana")
              } finally {
                setUpdating(false)
              }
            }}
          />
        ))
      ) : courses.length > 0 ? (
        courses.map((ci, index) => (
          <Card key={ci.course?.id || index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
                  {index + 1}
                </span>
                <span>{ci.course?.title || "Curso"}</span>
              </CardTitle>
              <CardDescription>
                {ci.reason || "Seleccionado por la IA para tu objetivo"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {ci.course?.category && (
                  <Badge variant="outline" className="text-xs">
                    {ci.course.category}
                  </Badge>
                )}
                {typeof ci.course?.estimated_duration === "number" && (
                  <span>{Math.floor(ci.course.estimated_duration / 60)}h</span>
                )}
                {ci.course?.difficulty_level && <span>{ci.course.difficulty_level}</span>}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin cursos</CardTitle>
            <CardDescription>Esta ruta aún no contiene cursos.</CardDescription>
          </CardHeader>
        </Card>
      )}
      <div className="text-xs text-gray-500">{updating && "Actualizando progreso…"}</div>
    </div>
  )
}

function AnimatedWeekCard({
  week,
  index,
  onToggleResource,
  onCompleteWeek,
}: {
  week: RoadmapWeek
  index: number
  onToggleResource: (resourceIndex: number, completed: boolean) => Promise<void>
  onCompleteWeek: () => Promise<void>
}) {
  const [title, setTitle] = React.useState("")
  React.useEffect(() => {
    const full = week.title || `Semana ${index + 1}`
    let i = 0
    const id = setInterval(() => {
      setTitle(full.slice(0, i + 1))
      i += 1
      if (i >= full.length) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [week.title, index])

  return (
    <Card className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span>{title}</span>
          {!week.completed && (
            <Button size="sm" variant="outline" onClick={onCompleteWeek}>Marcar semana completada</Button>
          )}
          {week.completed && <Badge>Completada</Badge>}
        </CardTitle>
        {Array.isArray(week.goals) && week.goals.length > 0 && (
          <CardDescription>
            Objetivos: {week.goals.join(', ')}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {Array.isArray(week.resources) && week.resources.length > 0 ? (
          <div className="space-y-2">
            {week.resources.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{r.type || 'recurso'}</Badge>
                  <span className={r.completed ? "line-through" : ""}>{r.title || 'Recurso'}</span>
                </div>
                {r.url && (
                  <a className="text-primary hover:underline" href={r.url} target="_blank" rel="noreferrer">Abrir</a>
                )}
                <Button size="sm" variant={r.completed ? "secondary" : "outline"} onClick={() => onToggleResource(i, !r.completed)}>
                  {r.completed ? "Desmarcar" : "Completar"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin recursos para esta semana.</p>
        )}
      </CardContent>
    </Card>
  )
}

async function safeGetError(res: Response) {
  try {
    const j = await res.json()
    return j?.error || res.statusText
  } catch {
    return res.statusText
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
