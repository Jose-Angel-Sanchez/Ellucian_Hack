export type Roadmap = { weeks?: Array<{ completed?: boolean; resources?: Array<{ completed?: boolean; type?: string }> }> }

export function computeRoadmapPercent(roadmap: Roadmap | undefined | null): number {
  if (!roadmap || !Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) return 0

  let total = 0
  let done = 0

  for (const w of roadmap.weeks) {
    const res = Array.isArray(w.resources) ? w.resources : []
    if (res.length === 0) {
      // Count empty weeks as 1 unit
      total += 1
      if (w.completed) done += 1
      continue
    }
    for (const r of res) {
      total += 1
      if (r.completed || w.completed) done += 1
    }
  }

  if (total === 0) return 0
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)))
}
