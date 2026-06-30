"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
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

const STORAGE_KEY = "studymap:state"

function loadFromStorage(): { map: StudyMap | null; progress: ProgressMap; streak: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

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
  const saved = !initialMap ? loadFromStorage() : null
  const [map, setMap] = useState<StudyMap | null>(saved?.map ?? initialMap)
  const [progress, setProgress] = useState<ProgressMap>(saved?.progress ?? initialProgress)
  const [streak, setStreak] = useState(saved?.streak ?? initialStreak)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [lessonNodeId, setLessonNodeId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true
      if (!initialMap) {
        const saved = loadFromStorage()
        if (saved?.map) {
          setMap(saved.map)
          setProgress(saved.progress)
          setStreak(saved.streak)
        }
      }
    }
  }, [initialMap])

  useEffect(() => {
    const timer = setInterval(() => {
      if (map) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ map, progress, streak })) } catch {}
      }
    }, 30000)
    return () => clearInterval(timer)
  }, [map, progress, streak])

  const prevStateRef = useRef({ map, progress, streak })
  useEffect(() => {
    if (prevStateRef.current.map !== map || prevStateRef.current.progress !== progress) {
      if (map) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ map, progress, streak })) } catch {}
      }
      prevStateRef.current = { map, progress, streak }
    }
  }, [map, progress, streak])

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
    setStreak((s) => {
      const today = new Date().toISOString().slice(0, 10)
      const lastActive = typeof window !== "undefined" ? localStorage.getItem("studymap:lastActive") : null
      if (lastActive === today) return s
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)
      if (lastActive === yesterdayStr) return s + 1
      return 1
    })
    if (typeof window !== "undefined") {
      localStorage.setItem("studymap:lastActive", new Date().toISOString().slice(0, 10))
    }
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
