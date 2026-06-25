"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createAuthClient } from "better-auth/react"
import { masteryFromScore } from "./study"
import type { ProgressMap, StudyMap } from "./types"
import { anonymousClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    anonymousClient()
  ]
})

export type View = "landing" | "upload" | "app"

interface GenerateInput {
  text: string
  source: string
  file?: File | null
}

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isAnonymous: boolean
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

  // Auth and persistence
  user: User | null
  isLoadingUser: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
  rateLimitRemaining: number
  rateLimitResetAt: Date | null
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
  
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [rateLimitRemaining, setRateLimitRemaining] = useState(3)
  const [rateLimitResetAt, setRateLimitResetAt] = useState<Date | null>(null)

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }, [theme])

  // Load user session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const session = await authClient.getSession()
        const sessionData = session.data

        if (sessionData && sessionData.user) {
          const u = {
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email || null,
            image: sessionData.user.image || null,
            isAnonymous: sessionData.user.isAnonymous || false,
          }
          setUser(u)
          setRateLimitRemaining(u.isAnonymous ? 3 : 10)
          if (u.isAnonymous) {
            localStorage.setItem("studymap:anonymousId", u.id)
          }
        } else {
          // Sign in anonymously if no session
          const result = await authClient.signIn.anonymous()
          if (result.data?.user) {
            const u = {
              id: result.data.user.id,
              name: result.data.user.name,
              email: result.data.user.email || null,
              image: result.data.user.image || null,
              isAnonymous: true,
            }
            setUser(u)
            setRateLimitRemaining(3)
            localStorage.setItem("studymap:anonymousId", u.id)
          }
        }
      } catch (error) {
        console.error("Failed to load user session:", error)
      } finally {
        setIsLoadingUser(false)
      }
    }
    loadUser()
  }, [])

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

      const data = (await res.json()) as {
        map?: StudyMap
        error?: string
        remaining?: number | null
        resetAt?: string | null
      }

      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar el mapa")
      }

      if (!data.map) {
        throw new Error("Respuesta inválida del servidor")
      }

      if (typeof data.remaining === "number") {
        setRateLimitRemaining(data.remaining)
      }
      if (data.resetAt) {
        setRateLimitResetAt(new Date(data.resetAt))
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

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
  }

  const signInWithEmail = async (email: string) => {
    const res = await fetch("/api/auth/magic-link/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || "Error al enviar enlace mágico")
    }
  }

  const signOut = async () => {
    await authClient.signOut()
    // Recreate anonymous session immediately
    try {
      const result = await authClient.signIn.anonymous()
      if (result.data?.user) {
        const u = {
          id: result.data.user.id,
          name: result.data.user.name,
          email: result.data.user.email || null,
          image: result.data.user.image || null,
          isAnonymous: true,
        }
        setUser(u)
        setRateLimitRemaining(3)
        setRateLimitResetAt(null)
        localStorage.setItem("studymap:anonymousId", u.id)
      } else {
        setUser(null)
        setRateLimitRemaining(3)
        setRateLimitResetAt(null)
      }
    } catch (error) {
      console.error("Failed to create anonymous session after sign out:", error)
      setUser(null)
      setRateLimitRemaining(3)
      setRateLimitResetAt(null)
    }
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
    user,
    isLoadingUser,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    rateLimitRemaining,
    rateLimitResetAt,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error("useStudy must be used within StudyProvider")
  return ctx
}
