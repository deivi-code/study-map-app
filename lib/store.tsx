"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { masteryFromScore } from "./study"
import type { ProgressMap, StudyMap } from "./types"

export type View = "landing" | "upload" | "app"

interface StudyState {
  map: StudyMap | null
  setMap: (m: StudyMap | null) => void

  progress: ProgressMap
  setProgress: (p: ProgressMap) => void
  recordLesson: (nodeId: string, score: number) => void

  streak: number
  setStreak: (s: number) => void

  activeNodeId: string | null
  openNode: (id: string) => void
  closeNode: () => void

  lessonNodeId: string | null
  startLesson: (id: string) => void
  endLesson: () => void

  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
  generateError: string | null
  setGenerateError: (e: string | null) => void
  clearGenerateError: () => void
}

const StudyContext = createContext<StudyState | null>(null)

export function StudyProvider({
  children,
  initialMap = null,
  initialProgress = {},
  initialStreak = 0,
}: {
  children: React.ReactNode
  initialMap?: StudyMap | null
  initialProgress?: ProgressMap
  initialStreak?: number
}) {
  const [map, setMap] = useState<StudyMap | null>(initialMap)
  const [progress, setProgress] = useState<ProgressMap>(initialProgress)
  const [streak, setStreak] = useState(initialStreak)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [lessonNodeId, setLessonNodeId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const recordLesson = useCallback((nodeId: string, score: number) => {
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
  }, [])

  const closeNode = useCallback(() => setActiveNodeId(null), [])
  const endLesson = useCallback(() => setLessonNodeId(null), [])
  const clearGenerateError = useCallback(() => setGenerateError(null), [])

  const value: StudyState = {
    map,
    setMap,
    progress,
    setProgress,
    recordLesson,
    streak,
    setStreak,
    activeNodeId,
    openNode: setActiveNodeId,
    closeNode,
    lessonNodeId,
    startLesson: setLessonNodeId,
    endLesson,
    isGenerating,
    setIsGenerating,
    generateError,
    setGenerateError,
    clearGenerateError,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error("useStudy must be used within StudyProvider")
  return ctx
}
