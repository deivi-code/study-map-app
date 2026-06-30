import { templates } from "./templates"
import { legacyNodesToKnowledgeNodes } from "./migrate-lesson"
import type { KnowledgeNode, Mastery, ProgressMap, StudyMap } from "./types"

let counter = 0

/** Picks a subject template from the user input and builds a study map. */
export function generateStudyMap(input: { text: string; source: string }): StudyMap {
  const haystack = `${input.text} ${input.source}`.toLowerCase()

  let best = templates[0]
  let bestScore = -1
  for (const t of templates) {
    const score = t.match.reduce((acc, kw) => (haystack.includes(kw) ? acc + 1 : acc), 0)
    if (score > bestScore) {
      best = t
      bestScore = score
    }
  }

  // If nothing matched, rotate through templates so repeated uploads vary.
  if (bestScore <= 0) {
    best = templates[counter % templates.length]
    counter++
  }

  return {
    id: `map-${Date.now()}`,
    subject: best.subject,
    source: input.source,
    createdAt: Date.now(),
    nodes: legacyNodesToKnowledgeNodes(best.nodes, best.key),
  }
}

export function masteryFromScore(score: number): Mastery {
  if (score >= 80) return "green"
  if (score >= 40) return "amber"
  return "red"
}

export function masteryToInt(m: Mastery): number {
  const map: Record<Mastery, number> = { locked: 0, red: 1, amber: 2, green: 3 }
  return map[m]
}

export function intToMastery(v: number): Mastery {
  const map: Record<number, Mastery> = { 0: "locked", 1: "red", 2: "amber", 3: "green" }
  return map[v] ?? "locked"
}

/** A node is unlocked when all its dependencies are at least amber. */
export function isUnlocked(node: KnowledgeNode, progress: ProgressMap): boolean {
  if (node.deps.length === 0) return true
  return node.deps.every((dep) => {
    const p = progress[dep]
    return p && (p.mastery === "amber" || p.mastery === "green")
  })
}

export function getMastery(nodeId: string, node: KnowledgeNode, progress: ProgressMap): Mastery {
  const p = progress[nodeId]
  if (p) return p.mastery
  return isUnlocked(node, progress) ? "red" : "locked"
}

export interface MapStats {
  total: number
  green: number
  amber: number
  red: number
  locked: number
  overall: number
  weak: KnowledgeNode[]
}

export function computeStats(map: StudyMap, progress: ProgressMap): MapStats {
  let green = 0
  let amber = 0
  let red = 0
  let locked = 0
  let scoreSum = 0
  const weak: KnowledgeNode[] = []

  for (const node of map.nodes) {
    const m = getMastery(node.id, node, progress)
    const score = progress[node.id]?.score ?? 0
    scoreSum += m === "green" ? 100 : score
    if (m === "green") green++
    else if (m === "amber") {
      amber++
      weak.push(node)
    } else if (m === "red") {
      red++
      weak.push(node)
    } else locked++
  }

  return {
    total: map.nodes.length,
    green,
    amber,
    red,
    locked,
    overall: Math.round((scoreSum / (map.nodes.length * 100)) * 100),
    weak,
  }
}

export interface PositionedNode extends KnowledgeNode {
  x: number
  y: number
}

/** Lays nodes out by level (rows) and spreads them horizontally. */
export function layoutNodes(nodes: KnowledgeNode[]): {
  positioned: PositionedNode[]
  width: number
  height: number
} {
  const levels = new Map<number, KnowledgeNode[]>()
  for (const n of nodes) {
    const arr = levels.get(n.level) ?? []
    arr.push(n)
    levels.set(n.level, arr)
  }

  const sortedLevels = [...levels.keys()].sort((a, b) => a - b)
  const colGap = 260
  const rowGap = 200
  const padX = 140
  const padY = 120

  const maxCols = Math.max(...[...levels.values()].map((a) => a.length))
  const width = padX * 2 + (maxCols - 1) * colGap
  const positioned: PositionedNode[] = []

  sortedLevels.forEach((level, rowIdx) => {
    const row = levels.get(level)!
    const rowWidth = (row.length - 1) * colGap
    const startX = (width - rowWidth) / 2
    row.forEach((node, i) => {
      positioned.push({
        ...node,
        x: startX + i * colGap,
        y: padY + rowIdx * rowGap,
      })
    })
  })

  const height = padY * 2 + (sortedLevels.length - 1) * rowGap
  return { positioned, width, height }
}

export const masteryMeta: Record<
  Mastery,
  { label: string; color: string; coach: string }
> = {
  locked: { label: "Bloqueado", color: "var(--mastery-locked)", coach: "Domina los temas previos para desbloquear." },
  red: { label: "Por aprender", color: "var(--mastery-red)", coach: "Empieza por aquí, aún no lo dominas." },
  amber: { label: "En progreso", color: "var(--mastery-amber)", coach: "Bien, pero puedes mejorar. Repite la lección." },
  green: { label: "Dominado", color: "var(--mastery-green)", coach: "Dominado. ¡Buen trabajo!" },
}

export const loaderSteps = [
  "Analizando apuntes…",
  "Detectando conceptos clave…",
  "Construyendo mapa de conocimiento…",
  "Creando rutas de aprendizaje…",
  "Generando lecciones adaptativas…",
]
