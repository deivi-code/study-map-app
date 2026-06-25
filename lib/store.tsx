"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { masteryFromScore } from "./study"
import type { ProgressMap, StudyMap } from "./types"

export type View = "landing" | "upload" | "app"

interface GenerateInput {
  text: string
  source: string
  file?: File | null
}

interface StudyState {
  view: View
  setView: (v: View) => void

  map: StudyMap | null
  generate: (input: GenerateInput) => Promise<void>
  isGenerating: boolean
  generateError: string | null
  clearGenerateError: () => void
  reset: () => void

  progress: ProgressMap
  recordLesson: (nodeId: string, score: number) => void

  streak: number

  activeNodeId: string | null
  openNode: (id: string) => void
  closeNode: () => void

  lessonNodeId: string | null
  startLesson: (id: string) => void
  endLesson: () => void

  theme: "dark" | "light"
  toggleTheme: () => void
}

const StudyContext = createContext<StudyState | null>(null)

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("landing")
  const [map, setMap] = useState<StudyMap | null>(null)
  const [progress, setProgress] = useState<ProgressMap>({})
  const [streak, setStreak] = useState(0)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [lessonNodeId, setLessonNodeId] = useState<string | null>(null)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }, [theme])

  const generate = async (input: GenerateInput) => {
    setIsGenerating(true)
    setGenerateError(null)

    try {
      const formData = new FormData()
      formData.append("text", input.text)
      formData.append("source", input.source)
      if (input.file) formData.append("file", input.file)

      const res = await fetch("/api/generate-map", {
        method: "POST",
        body: formData,
      })

      const data = (await res.json()) as { map?: StudyMap; error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar el mapa")
      }

      if (!data.map) {
        throw new Error("Respuesta inválida del servidor")
      }

      setMap(data.map)
      setProgress({})
      setActiveNodeId(null)
      setLessonNodeId(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al generar el mapa"
      setGenerateError(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  const reset = () => {
    setMap(null)
    setProgress({})
    setActiveNodeId(null)
    setLessonNodeId(null)
    setGenerateError(null)
    setView("landing")
  }

  const recordLesson = (nodeId: string, score: number) => {
    setProgress((prev) => {
      const existing = prev[nodeId]
      const bestScore = Math.max(existing?.score ?? 0, score)
      return {
        ...prev,
        [nodeId]: {
          score: bestScore,
          mastery: masteryFromScore(bestScore),
          attempts: (existing?.attempts ?? 0) + 1,
        },
      }
    })
    setStreak((s) => s + 1)
  }

  const value: StudyState = {
    view,
    setView,
    map,
    generate,
    isGenerating,
    generateError,
    clearGenerateError: () => setGenerateError(null),
    reset,
    progress,
    recordLesson,
    streak,
    activeNodeId,
    openNode: setActiveNodeId,
    closeNode: () => setActiveNodeId(null),
    lessonNodeId,
    startLesson: setLessonNodeId,
    endLesson: () => setLessonNodeId(null),
    theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error("useStudy must be used within StudyProvider")
  return ctx
}
