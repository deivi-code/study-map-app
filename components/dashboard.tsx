"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Flame, Target, TrendingUp } from "lucide-react"
import { useStudy } from "@/lib/store"
import { computeStats, getMastery, masteryMeta } from "@/lib/study"

export function Dashboard() {
  const { map, progress, streak, openNode } = useStudy()
  if (!map) return null
  const stats = computeStats(map, progress)
  const circ = 2 * Math.PI * 60

  const coach =
    stats.overall >= 80
      ? "Vas como un crack. ¡Casi dominas todo el mapa!"
      : stats.overall >= 40
        ? "Buen ritmo. Refuerza los nodos débiles para subir de nivel."
        : "Acabas de empezar. Desbloquea nodos completando lecciones."

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tu progreso</h1>
      <p className="mt-1 text-muted-foreground">{coach}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {/* Overall ring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 p-6"
        >
          <div className="relative grid place-items-center">
            <svg width="160" height="160" className="-rotate-90">
              <circle cx="80" cy="80" r="60" fill="none" stroke="var(--muted)" strokeWidth="12" />
              <motion.circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - (circ * stats.overall) / 100 }}
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-semibold tabular-nums">{stats.overall}%</span>
              <span className="text-xs text-muted-foreground">dominio total</span>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
          <StatCard icon={CheckCircle2} label="Nodos dominados" value={`${stats.green}/${stats.total}`} color="var(--mastery-green)" delay={0.05} />
          <StatCard icon={Target} label="Nodos débiles" value={`${stats.weak.length}`} color="var(--mastery-amber)" delay={0.1} />
          <StatCard icon={Flame} label="Racha de estudio" value={`${streak}`} suffix="lecciones" color="var(--mastery-red)" delay={0.15} />
          <StatCard icon={TrendingUp} label="Por explorar" value={`${stats.locked + stats.red}`} color="var(--primary)" delay={0.2} />
        </div>
      </div>

      {/* Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 rounded-2xl border border-border bg-card/60 p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground">Distribución de dominio</h2>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted">
          {[
            { v: stats.green, c: "var(--mastery-green)" },
            { v: stats.amber, c: "var(--mastery-amber)" },
            { v: stats.red, c: "var(--mastery-red)" },
            { v: stats.locked, c: "var(--mastery-locked)" },
          ].map((seg, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(seg.v / stats.total) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
              style={{ background: seg.c }}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          {(["green", "amber", "red", "locked"] as const).map((m) => (
            <span key={m} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: masteryMeta[m].color }} />
              {masteryMeta[m].label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Per-node progress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4 rounded-2xl border border-border bg-card/60 p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground">Dominio por concepto</h2>
        <div className="mt-4 space-y-3">
          {map.nodes.map((node, i) => {
            const m = getMastery(node.id, node, progress)
            const meta = masteryMeta[m]
            const pct = m === "green" ? 100 : progress[node.id]?.score ?? 0
            const locked = m === "locked"
            return (
              <button
                key={node.id}
                disabled={locked}
                onClick={() => openNode(node.id)}
                className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="w-40 shrink-0 truncate text-sm font-medium">{node.title}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums" style={{ color: meta.color }}>
                  {locked ? "—" : `${pct}%`}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {stats.weak.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-2xl border border-mastery-amber/30 bg-mastery-amber/5 p-6"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Target className="size-4 text-mastery-amber" />
            Repasa estos conceptos
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.weak.map((node) => (
              <button
                key={node.id}
                onClick={() => openNode(node.id)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-mastery-amber/60"
              >
                {node.title}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  suffix?: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card/60 p-5"
    >
      <span className="grid size-9 place-items-center rounded-lg" style={{ background: `color-mix(in oklch, ${color} 16%, transparent)`, color }}>
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-2xl font-semibold tabular-nums">
        {value} {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  )
}
