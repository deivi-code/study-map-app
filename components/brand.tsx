"use client"

import { Moon, Sun, User, LogOut, LogIn } from "lucide-react"
import { useStudy } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
        <svg viewBox="0 0 24 24" className="size-5 text-primary" aria-hidden="true">
          <circle cx="12" cy="5" r="2.4" fill="currentColor" />
          <circle cx="5.5" cy="17" r="2.4" fill="currentColor" opacity="0.65" />
          <circle cx="18.5" cy="17" r="2.4" fill="currentColor" opacity="0.65" />
          <path
            d="M12 7.4 6.6 14.8M12 7.4l5.4 7.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Mapa de Estudio</span>
    </div>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useStudy()
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
  const { user, isLoadingUser, signInWithGoogle, signOut } = useStudy()
  const [showMenu, setShowMenu] = useState(false)

  if (isLoadingUser) {
    return (
      <div className={cn("size-9 animate-pulse rounded-lg bg-muted", className)} />
    )
  }

  if (user) {
    return (
      <div className="relative">
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
                signOut()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent",
        className,
      )}
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">Iniciar sesión</span>
    </button>
  )
}
