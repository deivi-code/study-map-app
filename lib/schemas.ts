import { z } from "zod"
import { hintRevealsAnswer, normalizeAnswer } from "./answer-check"
import type { StudyMap } from "./types"

const theoryStepSchema = z.object({
  type: z.literal("theory"),
  id: z.string().min(1),
  content: z.string().min(10).max(400),
})

const choiceStepSchema = z.object({
  type: z.literal("choice"),
  id: z.string().min(1),
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
})

const textStepSchema = z.object({
  type: z.literal("text"),
  id: z.string().min(1),
  question: z.string().min(5),
  hint: z.string().min(3).max(120),
  acceptedAnswers: z.array(z.string().min(1)).min(1).max(8),
  explanation: z.string().min(5),
})

export const lessonStepSchema = z.discriminatedUnion("type", [
  theoryStepSchema,
  choiceStepSchema,
  textStepSchema,
])

export const knowledgeNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  summary: z.string().min(10),
  detail: z.string().min(20),
  examples: z.array(z.string()).min(1).max(2),
  level: z.number().int().min(0).max(10),
  deps: z.array(z.string()),
  steps: z.array(lessonStepSchema).min(3).max(10),
})

/** Schema for LLM structured output (without map metadata). */
export const llmStudyMapSchema = z.object({
  subject: z.string().min(2),
  nodes: z.array(knowledgeNodeSchema).min(3).max(12),
})

export type LlmStudyMap = z.infer<typeof llmStudyMapSchema>

function validateNodeSteps(node: LlmStudyMap["nodes"][number]): string | null {
  const theoryCount = node.steps.filter((s) => s.type === "theory").length
  const assessable = node.steps.filter((s) => s.type === "choice" || s.type === "text")
  if (theoryCount > 2) return `Nodo "${node.id}": demasiados pasos de teoría (máx. 2)`
  if (assessable.length < 2) return `Nodo "${node.id}": necesita al menos 2 pasos evaluables`

  const stepIds = new Set(node.steps.map((s) => s.id))
  if (stepIds.size !== node.steps.length) return `Nodo "${node.id}": IDs de pasos duplicados`

  for (const step of node.steps) {
    if (step.type === "choice" && step.correctIndex >= step.options.length) {
      return `Paso "${step.id}": correctIndex fuera de rango`
    }
    if (step.type === "text" && hintRevealsAnswer(step.hint, step.acceptedAnswers)) {
      return `Paso "${step.id}": el hint revela la respuesta`
    }
    if (step.type === "text") {
      for (const a of step.acceptedAnswers) {
        if (normalizeAnswer(step.hint).includes(normalizeAnswer(a)) && normalizeAnswer(a).length > 4) {
          return `Paso "${step.id}": el hint contiene una respuesta aceptada`
        }
      }
    }
  }
  return null
}

export function validateStudyMapGraph(nodes: LlmStudyMap["nodes"]): string | null {
  const ids = new Set(nodes.map((n) => n.id))
  if (ids.size !== nodes.length) return "IDs de nodos duplicados"

  for (const node of nodes) {
    for (const dep of node.deps) {
      if (!ids.has(dep)) return `El nodo "${node.id}" depende de "${dep}" que no existe`
      if (dep === node.id) return `El nodo "${node.id}" no puede depender de sí mismo`
    }
    const stepError = validateNodeSteps(node)
    if (stepError) return stepError
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()

  function dfs(id: string): boolean {
    if (visiting.has(id)) return false
    if (visited.has(id)) return true
    visiting.add(id)
    const node = nodes.find((n) => n.id === id)
    if (node) {
      for (const dep of node.deps) {
        if (!dfs(dep)) return false
      }
    }
    visiting.delete(id)
    visited.add(id)
    return true
  }

  for (const node of nodes) {
    if (!dfs(node.id)) return "El grafo de dependencias tiene un ciclo"
  }

  const roots = nodes.filter((n) => n.deps.length === 0)
  if (roots.length === 0) return "Debe haber al menos un nodo raíz sin dependencias"

  return null
}

export function toStudyMap(llm: LlmStudyMap, source: string): StudyMap {
  return {
    id: `map-${Date.now()}`,
    subject: llm.subject,
    source,
    createdAt: Date.now(),
    nodes: llm.nodes,
  }
}
