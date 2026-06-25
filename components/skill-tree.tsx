"use client"

import { motion } from "framer-motion"
import { Check, Lock, Minus, Plus, Maximize } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useStudy } from "@/lib/store"
import { getMastery, layoutNodes, masteryMeta, type PositionedNode } from "@/lib/study"
import type { Mastery, ProgressMap } from "@/lib/types"
import { cn } from "@/lib/utils"

const NODE = 76

export function SkillTree() {
  const { map, progress, openNode } = useStudy()
  const { positioned, width, height } = useMemo(
    () => layoutNodes(map?.nodes ?? []),
    [map],
  )

  return (
    <>
      <div className="hidden lg:block">
        <GraphView positioned={positioned} width={width} height={height} progress={progress} onOpen={openNode} />
      </div>
      <div className="lg:hidden">
        <ListView positioned={positioned} progress={progress} onOpen={openNode} />
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ x: 0, y: 0, s: 0.85 })
  const drag = useRef<{ active: boolean; sx: number; sy: number; ox: number; oy: number }>({
    active: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
  })

  const center = () => {
    const c = containerRef.current
    if (!c) return
    const s = 0.85
    setT({ x: (c.clientWidth - width * s) / 2, y: 40, s })
  }

  useEffect(() => {
    center()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
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
    >
      {/* subtle dot grid */}
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
              const parent = positioned.find((n) => n.id === depId)
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

      {/* Zoom controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 rounded-xl border border-border bg-card/80 p-1.5 backdrop-blur">
        <ZoomBtn label="Acercar" onClick={() => setT((p) => ({ ...p, s: Math.min(1.8, p.s + 0.15) }))}>
          <Plus className="size-4" />
        </ZoomBtn>
        <ZoomBtn label="Alejar" onClick={() => setT((p) => ({ ...p, s: Math.max(0.4, p.s - 0.15) }))}>
          <Minus className="size-4" />
        </ZoomBtn>
        <ZoomBtn label="Centrar" onClick={center}>
          <Maximize className="size-4" />
        </ZoomBtn>
      </div>

      <p className="pointer-events-none absolute bottom-5 left-5 text-xs text-muted-foreground">
        Arrastra para mover · rueda para zoom
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
      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 200, damping: 16 }}
      whileHover={locked ? {} : { scale: 1.08, y: -2 }}
      className={cn(
        "group absolute flex flex-col items-center",
        locked ? "cursor-not-allowed" : "cursor-pointer",
      )}
      style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)", width: 150 }}
    >
      <span className="relative grid place-items-center" style={{ width: NODE, height: NODE }}>
        {/* glow */}
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
  onOpen,
}: {
  positioned: PositionedNode[]
  progress: ProgressMap
  onOpen: (id: string) => void
}) {
  const ordered = [...positioned].sort((a, b) => a.level - b.level)
  return (
    <div className="mx-auto max-w-lg space-y-3 px-4 py-6">
      {ordered.map((node, i) => {
        const m = getMastery(node.id, node, progress)
        const meta = masteryMeta[m]
        const locked = m === "locked"
        const pct = m === "green" ? 100 : progress[node.id]?.score ?? 0
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
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
