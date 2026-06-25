"use client"

import { Moon, Sun } from "lucide-react"
import { useStudy } from "@/lib/store"
import { cn } from "@/lib/utils"

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
