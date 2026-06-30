"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { authClient } from "./auth-client"

const AUTH_COOKIE = "studymap:authenticated"

function setAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  isAnonymous: boolean
}

export interface AuthContextValue {
  user: User | null
  isLoadingUser: boolean
  rateLimitRemaining: number
  rateLimitResetAt: Date | null
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [rateLimitRemaining, setRateLimitRemaining] = useState(3)
  const [rateLimitResetAt, setRateLimitResetAt] = useState<Date | null>(null)

  const refreshSession = async () => {
    try {
      const session = await authClient.getSession()
      const sessionData = session.data

      if (sessionData?.user) {
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
          clearAuthCookie()
        } else {
          localStorage.removeItem("studymap:anonymousId")
          setAuthCookie()
        }
      } else {
        clearAuthCookie()
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

  useEffect(() => {
    refreshSession()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoadingUser, rateLimitRemaining, rateLimitResetAt, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
