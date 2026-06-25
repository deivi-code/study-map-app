"use client"

import { useState } from "react"
import { useStudy } from "@/lib/store"
import { Logo, ThemeToggle, AuthButton } from "@/components/brand"
import { Landing } from "@/components/landing"
import { UploadScreen } from "@/components/upload-screen"
import { SkillTree } from "@/components/skill-tree"
import { NodeDrawer } from "@/components/node-drawer"
import { LessonMode } from "@/components/lesson-mode"
import { Dashboard } from "@/components/dashboard"
import { Map, BarChart3, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Tab = "tree" | "dashboard"

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-lg bg-secondary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </button>
  )
}

export function AppShell() {
  const { view, setView, map, lessonNodeId } = useStudy()
  const [tab, setTab] = useState<Tab>("tree")

  if (view === "landing") {
    return <Landing />
  }

  if (view === "upload") {
    return (
      <main className="min-h-dvh">
        <UploadScreen />
      </main>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button onClick={() => setView("landing")} aria-label="Ir al inicio">
            <Logo />
          </button>
          {map && (
            <nav className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1">
              <NavButton
                active={tab === "tree"}
                onClick={() => setTab("tree")}
                icon={<Map className="h-4 w-4" />}
                label="Mapa"
              />
              <NavButton
                active={tab === "dashboard"}
                onClick={() => setTab("dashboard")}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Progreso"
              />
            </nav>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("upload")}
              className="hidden items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Plus className="h-4 w-4" />
              Nuevo mapa
            </button>
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {tab === "tree" && (
            <motion.div
              key="tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <SkillTree />
            </motion.div>
          )}
          {tab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NodeDrawer />
      <AnimatePresence>{lessonNodeId && <LessonMode key="lesson" />}</AnimatePresence>
    </div>
  )
}
