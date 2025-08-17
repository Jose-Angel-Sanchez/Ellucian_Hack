export type RoadmapResource = { type?: string; title?: string; url?: string }
export type RoadmapWeek = { title?: string; goals?: string[]; resources?: RoadmapResource[] }
export type Roadmap = { weeks: RoadmapWeek[] }

const ALLOWED_DOMAINS = [
  "developer.mozilla.org",
  "web.dev",
  "developers.google.com",
  "freecodecamp.org",
  "www.freecodecamp.org",
  "react.dev",
  "nextjs.org",
  "nodejs.org",
  "docs.python.org",
  "kotlinlang.org",
  "go.dev",
  "docs.oracle.com",
  "supabase.com",
  "supabase.com/docs",
  "www.postgresql.org",
  "www.tensorflow.org",
  "pytorch.org",
  "scikit-learn.org",
  "www.youtube.com",
  "youtu.be",
  "dev.to",
  "css-tricks.com",
]

// Very small curated catalog by topic keyword
const CURATED_BY_TOPIC: Record<string, { videos: RoadmapResource[]; articles: RoadmapResource[] }> = {
  javascript: {
    videos: [
      { type: "video", title: "JavaScript Full Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg" },
      { type: "video", title: "Modern JS Crash Course - Traversy", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c" },
    ],
    articles: [
      { type: "article", title: "MDN: JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
      { type: "article", title: "web.dev: Learn JavaScript", url: "https://web.dev/learn/javascript/" },
    ],
  },
  react: {
    videos: [
      { type: "video", title: "React Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
    ],
    articles: [
      { type: "article", title: "React Docs: Quick Start", url: "https://react.dev/learn" },
      { type: "article", title: "Next.js Docs: Learn", url: "https://nextjs.org/learn" },
    ],
  },
  "inteligencia artificial": {
    videos: [
      { type: "video", title: "Intro a IA - freeCodeCamp", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
    ],
    articles: [
      { type: "article", title: "Scikit-learn: Getting Started", url: "https://scikit-learn.org/stable/getting_started.html" },
      { type: "article", title: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials" },
    ],
  },
}

function hasAllowedDomain(url?: string) {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.protocol === "https:" && ALLOWED_DOMAINS.some((d) => u.host === d || (d.includes("/") ? (u.host + u.pathname).startsWith(d) : false))
  } catch {
    return false
  }
}

function byTopic(topic: string) {
  const key = Object.keys(CURATED_BY_TOPIC).find((k) => topic.toLowerCase().includes(k)) || "javascript"
  return CURATED_BY_TOPIC[key]
}

export function enrichRoadmap(roadmap: Roadmap, topic: string): Roadmap {
  const curated = byTopic(topic)
  const weeks = (roadmap.weeks || []).map((w, idx) => {
    const goals = Array.isArray(w.goals) ? w.goals.filter(Boolean) : []
    while (goals.length < 3) goals.push(`Objetivo práctico ${goals.length + 1}`)

    let resources = Array.isArray(w.resources) ? w.resources.slice() : []
    // Validate existing URLs; drop invalid ones
    resources = resources.map((r) => ({ ...r, type: r.type || "article" })).filter((r) => !r.url || hasAllowedDomain(r.url))

    // Ensure at least 1 video and 1 article per week
    const hasVideo = resources.some((r) => r.type === "video")
    const hasArticle = resources.some((r) => r.type === "article")
    if (!hasVideo && curated.videos[0]) resources.unshift(curated.videos[0])
    if (!hasArticle && curated.articles[0]) resources.push(curated.articles[0])

    // Ensure an exercise placeholder
    if (!resources.some((r) => r.type === "exercise")) {
      resources.push({ type: "exercise", title: `Ejercicio: aplica lo aprendido en la semana ${idx + 1}` })
    }

    // Cap to reasonable amount
    resources = resources.slice(0, 5)

    const title = w.title || `Semana ${idx + 1}`
    return { title, goals, resources }
  })

  // If no weeks, create a sensible 4-week plan
  if (weeks.length === 0) {
    const base = ["Fundamentos", "Práctica guiada", "Proyecto pequeño", "Proyecto final y repaso"]
    return {
      weeks: base.map((label, i) => ({
        title: `Semana ${i + 1}: ${label}`,
        goals: ["Leer recursos", "Tomar notas", "Practicar con ejercicios"],
        resources: [curated.articles[0], curated.videos[0], { type: "exercise", title: "Ejercicio práctico" }].filter(Boolean) as RoadmapResource[],
      })),
    }
  }

  return { weeks }
}
