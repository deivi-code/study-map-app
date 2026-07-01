"use client"

import { motion } from "framer-motion"
import { Check, Lock, Minus, Plus, Maximize } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useStudy } from "@/lib/store"
import { getMastery, layoutNodes, masteryMeta, type PositionedNode } from "@/lib/study"
import type { Mastery, ProgressMap } from "@/lib/types"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "./loading-skeleton"

const NODE = 76

export function SkillTree() {
  const t = useTranslations("skillTree")
  const { map, progress, openNode } = useStudy()
  const [search, setSearch] = useState("")
  const { positioned, width, height } = useMemo(
    () => layoutNodes(map?.nodes ?? []),
    [map],
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return positioned
    const q = search.toLowerCase()
    return positioned.filter((n) => n.title.toLowerCase().includes(q))
  }, [positioned, search])

  if (!map || !positioned.length) return <LoadingSkeleton />

  return (
    <>
      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="mx-auto mb-2 mt-4 block w-[90%] max-w-sm rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden"
          aria-label={t('searchLabel')}
        />
      </div>
      <div className="hidden lg:block">
        <GraphView positioned={filtered} width={width} height={height} progress={progress} onOpen={openNode} />
      </div>
      <div className="lg:hidden">
        <ListView positioned={filtered} progress={progress} map={map} onOpen={openNode} />
      </div>
    </>
  )
}

function GraphView({
  positioned,
  width,
  height,
  progress,
  onOpen,
}: {
  positioned: PositionedNode[]
  width: number
  height: number
  progress: ProgressMap
  onOpen: (id: string) => void
}) {
  const parentMap = new Map<string, PositionedNode>()
  for (const n of positioned) {
    parentMap.set(n.id, n)
  }
  const containerRef = useRef<HTMLDivElement>(null)
  const tr = useTranslations("skillTree")
  const [t, setT] = useState({ x: 0, y: 0, s: 0.85 })
  const drag = useRef<{ active: boolean; sx: number; sy: number; ox: number; oy: number }>({
    active: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
  })

  const container = containerRef.current

  const center = () => {
    const c = containerRef.current
    if (!c) return
    const s = 0.85
    setT({ x: (c.clientWidth - width * s) / 2, y: 40, s })
  }

  useEffect(() => {
    center()
  }, [width, height])

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setT((prev) => {
        const ns = Math.min(1.8, Math.max(0.4, prev.s * (1 - e.deltaY * 0.0012)))
        return { ...prev, s: ns }
      })
    }
    c.addEventListener("wheel", onWheel, { passive: false })
    return () => c.removeEventListener("wheel", onWheel)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-4rem)] w-full touch-none overflow-hidden bg-[radial-gradient(100%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent)]"
      onPointerDown={(e) => {
        drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y }
        if (e.target instanceof HTMLElement) {
          try { e.target.setPointerCapture(e.pointerId) } catch {}
        }
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        setT((prev) => ({
          ...prev,
          x: drag.current.ox + (e.clientX - drag.current.sx),
          y: drag.current.oy + (e.clientY - drag.current.sy),
        }))
      }}
      onPointerUp={() => (drag.current.active = false)}
      onPointerLeave={() => (drag.current.active = false)}
      style={{ cursor: drag.current.active ? "grabbing" : "grab" }}
      role="application"
      aria-label={tr('graphAria')}
      tabIndex={0}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 12%, transparent) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, width, height }}
      >
        <svg width={width} height={height} className="absolute left-0 top-0 overflow-visible">
          {positioned.flatMap((node) =>
            node.deps.map((depId) => {
              const parent = parentMap.get(depId)
              if (!parent) return null
              const m = getMastery(node.id, node, progress)
              const lit = m !== "locked"
              return (
                <motion.line
                  key={`${depId}-${node.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={lit ? "var(--primary)" : "var(--border)"}
                  strokeWidth={lit ? 2 : 1.5}
                  strokeOpacity={lit ? 0.55 : 0.35}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 + node.level * 0.12 }}
                />
              )
            }),
          )}
        </svg>

        {positioned.map((node, i) => {
          const m = getMastery(node.id, node, progress)
          const score = progress[node.id]?.score ?? 0
          return (
            <GraphNode
              key={node.id}
              node={node}
              mastery={m}
              score={score}
              index={i}
              onOpen={() => m !== "locked" && onOpen(node.id)}
            />
          )
        })}
      </div>

      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 rounded-xl border border-border bg-card/80 p-1.5 backdrop-blur">
        <ZoomBtn label={tr('zoomIn')} onClick={() => setT((p) => ({ ...p, s: Math.min(1.8, p.s + 0.15) }))}>
          <Plus className="size-4" />
        </ZoomBtn>
        <ZoomBtn label={tr('zoomOut')} onClick={() => setT((p) => ({ ...p, s: Math.max(0.4, p.s - 0.15) }))}>
          <Minus className="size-4" />
        </ZoomBtn>
        <ZoomBtn label={tr('center')} onClick={center}>
          <Maximize className="size-4" />
        </ZoomBtn>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-5 text-xs text-muted-foreground">
        {tr('dragHint')}
      </p>
    </div>
  )
}

function ZoomBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground touch-manipulation"
    >
      {children}
    </button>
  )
}

function GraphNode({
  node,
  mastery,
  score,
  index,
  onOpen,
}: {
  node: PositionedNode
  mastery: Mastery
  score: number
  index: number
  onOpen: () => void
}) {
  const meta = masteryMeta[mastery]
  const locked = mastery === "locked"
  const pct = mastery === "green" ? 100 : score
  const circ = 2 * Math.PI * 34

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen() }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 200, damping: 16 }}
      whileHover={locked ? {} : { scale: 1.08, y: -2 }}
      className={cn(
        "group absolute flex flex-col items-center",
        locked ? "cursor-not-allowed" : "cursor-pointer",
      )}
      style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)", width: 150 }}
      tabIndex={locked ? -1 : 0}
      aria-label={`${node.title} - ${meta.label}`}
    >
      <span className="relative grid place-items-center" style={{ width: NODE, height: NODE }}>
        {!locked && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: meta.color, filter: "blur(14px)", opacity: 0.35 }}
            animate={{ opacity: [0.2, 0.42, 0.2] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          />
        )}
        <svg width={NODE} height={NODE} className="absolute -rotate-90">
          <circle cx={NODE / 2} cy={NODE / 2} r="34" fill="var(--card)" stroke="var(--border)" strokeWidth="4" />
          <motion.circle
            cx={NODE / 2}
            cy={NODE / 2}
            r="34"
            fill="none"
            stroke={meta.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
          />
        </svg>
        <span
          className="relative grid size-12 place-items-center rounded-full text-sm font-semibold"
          style={{
            background: locked ? "var(--muted)" : `color-mix(in oklch, ${meta.color} 18%, var(--card))`,
            color: locked ? "var(--muted-foreground)" : meta.color,
          }}
        >
          {locked ? (
            <Lock className="size-4" />
          ) : mastery === "green" ? (
            <Check className="size-5" />
          ) : (
            `${pct}%`
          )}
        </span>
      </span>
      <span
        className={cn(
          "mt-2 line-clamp-2 max-w-[150px] text-center text-[13px] font-medium leading-tight",
          locked && "text-muted-foreground",
        )}
      >
        {node.title}
      </span>
    </motion.button>
  )
}

function ListView({
  positioned,
  progress,
  map,
  onOpen,
}: {
  positioned: PositionedNode[]
  progress: ProgressMap
  map: { nodes: { id: string; title: string }[] }
  onOpen: (id: string) => void
}) {
  const t = useTranslations("skillTree")
  const ordered = [...positioned].sort((a, b) => a.level - b.level)
  return (
    <div className="mx-auto max-w-lg space-y-3 px-4 py-6">
      {ordered.map((node, i) => {
        const m = getMastery(node.id, node, progress)
        const meta = masteryMeta[m]
        const locked = m === "locked"
        const pct = m === "green" ? 100 : progress[node.id]?.score ?? 0
        const deps = node.deps
          .map((depId) => map.nodes.find((n) => n.id === depId))
          .filter(Boolean)
        return (
          <motion.button
            key={node.id}
            type="button"
            disabled={locked}
            onClick={() => onOpen(node.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card/60 p-3.5 text-left transition-colors",
              locked ? "opacity-60" : "hover:border-primary/40",
            )}
            aria-label={`${node.title} - ${meta.label}${deps.length > 0 ? `. ${t('requires')}${deps.map((d) => d?.title).join(", ")}` : ""}`}
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full text-xs font-semibold"
              style={{
                background: locked ? "var(--muted)" : `color-mix(in oklch, ${meta.color} 18%, var(--card))`,
                color: locked ? "var(--muted-foreground)" : meta.color,
                boxShadow: locked ? "none" : `0 0 0 2px color-mix(in oklch, ${meta.color} 40%, transparent)`,
              }}
            >
              {locked ? <Lock className="size-4" /> : m === "green" ? <Check className="size-5" /> : `${pct}%`}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{node.title}</span>
              <span className="text-xs" style={{ color: locked ? "var(--muted-foreground)" : meta.color }}>
                {meta.label}
              </span>
              {deps.length > 0 && (
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {t('requires')}{deps.map((d) => d?.title).join(", ")}
                </span>
              )}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}


