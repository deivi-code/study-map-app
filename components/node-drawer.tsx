"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Lightbulb, Lock, Play, RotateCcw, X } from "lucide-react"
import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { lessonStepSummary } from "@/lib/lesson"
import { useStudy } from "@/lib/store"
import { getMastery, masteryMeta } from "@/lib/study"

export function NodeDrawer() {
  const { map, activeNodeId, closeNode, progress } = useStudy()
  const node = map?.nodes.find((n) => n.id === activeNodeId) ?? null
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (activeNodeId) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [activeNodeId])

  useEffect(() => {
    if (!activeNodeId) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeNode()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [activeNodeId, closeNode])

  useEffect(() => {
    if (!activeNodeId || !drawerRef.current) return

    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length > 0) {
      focusable[0].focus()
    }

    return () => {
      previousFocusRef.current?.focus()
    }
  }, [activeNodeId])

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNode}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            ref={drawerRef}
            key={node.id}
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={node.title}
          >
            {(() => {
              const t = useTranslations("nodeDrawer")
              const m = getMastery(node.id, node, progress)
              const meta = masteryMeta[m]
              const p = progress[node.id]
              const pct = m === "green" ? 100 : p?.score ?? 0
              const { total, theory, assessable } = lessonStepSummary(node.steps)
              const locked = m === "locked"
              const deps = locked
                ? node.deps
                    .map((depId) => {
                      const dep = map?.nodes.find((n) => n.id === depId)
                      return dep ? { id: dep.id, title: dep.title, mastery: getMastery(dep.id, dep, progress) } : null
                    })
                    .filter(Boolean)
                : []

              return (
                <>
                  <header className="flex items-start justify-between gap-4 border-b border-border p-6">
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          background: `color-mix(in oklch, ${meta.color} 16%, transparent)`,
                          color: meta.color,
                        }}
                      >
                        <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </span>
                      <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight">{node.title}</h2>
                    </div>
                    <button
                      onClick={closeNode}
                      aria-label={t('close')}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-5" />
                    </button>
                  </header>

                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    {locked && deps.length > 0 && (
                      <div className="rounded-xl border border-mastery-locked/30 bg-mastery-locked/10 p-4">
                        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                          <Lock className="size-4" />
                          {t('requirements')}
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {deps.map((dep) => dep && (
                            <li key={dep.id} className="flex items-center gap-2 text-sm">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: masteryMeta[dep.mastery].color }}
                              />
                              <span className={dep.mastery === "locked" ? "text-muted-foreground" : ""}>
                                {dep.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {masteryMeta[dep.mastery].label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('progress')}</span>
                        <span style={{ color: meta.color }}>{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: meta.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      {p && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {p.attempts} {p.attempts === 1 ? t('attempt') : t('attempts')} · {meta.coach}
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">{t('explanation')}</h3>
                      <p className="mt-2 leading-relaxed text-foreground/90">{node.detail}</p>
                    </div>

                    <div>
                      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <Lightbulb className="size-4 text-mastery-amber" />
                        {t('examples')}
                      </h3>
                      <ul className="mt-3 space-y-2">
                        {node.examples.map((ex, i) => (
                          <li
                            key={i}
                            className="flex gap-2.5 rounded-xl border border-border bg-background/40 p-3 text-sm leading-relaxed"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-mastery-green" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                      {total} {t('stepsLabel')}
                      {theory > 0 && ` · ${theory} ${t('theoryLabel')}`}
                      {assessable > 0 && ` · ${assessable} ${t('questionsLabel')}`}
                    </div>
                  </div>

                  <footer className="border-t border-border p-6">
                    {locked ? (
                      <div className="rounded-xl border border-border bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                        {t('lockedMessage')}
                      </div>
                    ) : (
                      <Link
                        href={`/app/${map!.id}/lesson/${node.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01]"
                      >
                        {p ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
                        {p ? t('repeatLesson') : t('startLesson')}
                      </Link>
                    )}
                  </footer>
                </>
              )
            })()}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
