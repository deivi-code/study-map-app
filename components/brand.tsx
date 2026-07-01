"use client"

import { Moon, Sun, User, LogOut, LogIn, Map } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { ItineraryList } from "./itinerary-list"
import { AnimatePresence } from "framer-motion"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 24 24" className="size-7 text-primary" aria-hidden="true">
        <circle cx="12" cy="5" r="2.4" fill="currentColor" />
        <circle cx="5.5" cy="17" r="2.4" fill="currentColor" opacity="0.65" />
        <circle cx="18.5" cy="17" r="2.4" fill="currentColor" opacity="0.65" />
        <path d="M12 7.4 6.6 14.8M12 7.4l5.4 7.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      className={cn(
        "grid size-9 place-items-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent",
        className,
      )}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}

export function AuthButton({ className }: { className?: string }) {
  const { user, isLoadingUser } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showItineraryList, setShowItineraryList] = useState(false)

  if (isLoadingUser) {
    return (
      <div className={cn("size-9 animate-pulse rounded-lg bg-muted", className)} />
    )
  }

  const isAuthenticated = user && !user.isAnonymous

  async function handleSignOut() {
    await authClient.signOut()
    const result = await authClient.signIn.anonymous()
    if (result.data?.user) {
      localStorage.setItem("studymap:anonymousId", result.data.user.id)
    }
    window.location.href = "/"
  }

  return (
    <>
      <div className="relative flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent",
                className,
              )}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.name || "Usuario"}</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowItineraryList(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                >
                  <Map className="h-4 w-4" />
                  Mis itinerarios
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => {
                    handleSignOut()
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setShowItineraryList(true)}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent",
                className,
              )}
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Mis itinerarios</span>
            </button>
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent",
                className,
              )}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
          </>
        )}
      </div>

      <AnimatePresence>
        {showItineraryList && (
          <ItineraryList onClose={() => setShowItineraryList(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
