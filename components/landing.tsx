"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  BrainCircuit,
  Map as MapIcon,
  Sparkles,
  Target,
  Trophy,
  Upload,
} from "lucide-react"
import { AuthButton, Logo, ThemeToggle } from "./brand"
import { NodeField } from "./node-field"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { LocaleFooter } from "./locale-footer"

const features = [
  { icon: MapIcon, titleKey: "feature1Title", descKey: "feature1Desc" },
  { icon: BrainCircuit, titleKey: "feature2Title", descKey: "feature2Desc" },
  { icon: Target, titleKey: "feature3Title", descKey: "feature3Desc" },
  { icon: Trophy, titleKey: "feature4Title", descKey: "feature4Desc" },
]

const steps = [
  { n: "01", titleKey: "step1Title", descKey: "step1Desc" },
  { n: "02", titleKey: "step2Title", descKey: "step2Desc" },
  { n: "03", titleKey: "step3Title", descKey: "step3Desc" },
]

function MiniTree() {
  const nodes = [
    { id: 1, x: 50, y: 12, color: "var(--mastery-green)", delay: 0.1 },
    { id: 2, x: 22, y: 45, color: "var(--mastery-green)", delay: 0.25 },
    { id: 3, x: 78, y: 45, color: "var(--mastery-amber)", delay: 0.35 },
    { id: 4, x: 14, y: 82, color: "var(--mastery-amber)", delay: 0.5 },
    { id: 5, x: 40, y: 82, color: "var(--mastery-red)", delay: 0.6 },
    { id: 6, x: 82, y: 82, color: "var(--mastery-red)", delay: 0.7 },
  ]
  const links = [
    [1, 2],
    [1, 3],
    [2, 4],
    [2, 5],
    [3, 6],
  ]
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      {links.map(([a, b], i) => {
        const na = nodes.find((n) => n.id === a)!
        const nb = nodes.find((n) => n.id === b)!
        return (
          <motion.line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="var(--primary)"
            strokeWidth="0.6"
            strokeOpacity="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.2 + i * 0.12 }}
          />
        )
      })}
      {nodes.map((n) => (
        <motion.g
          key={n.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: n.delay, type: "spring", stiffness: 220, damping: 14 }}
        >
          <motion.circle
            cx={n.x}
            cy={n.y}
            r="6"
            fill={n.color}
            animate={{ opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: n.delay }}
            style={{ filter: "blur(2px)" }}
          />
          <circle cx={n.x} cy={n.y} r="3.4" fill={n.color} />
          <circle cx={n.x} cy={n.y} r="3.4" fill="none" stroke="var(--background)" strokeWidth="0.6" />
        </motion.g>
      ))}
    </svg>
  )
}

export function Landing() {
  const t = useTranslations("landing")
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NodeField className="pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]" />

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/upload"
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03] sm:block"
            >
              {t("cta")}
            </Link>
            <AuthButton />
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-2 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              {t("badge")}
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero")}{" "}
              <span className="text-primary">{t("heroHighlight")}</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/upload"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
              >
                <Upload className="size-4" />
                {t("cta")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="text-sm text-muted-foreground">{t("freeTag")}</span>
            </div>

            <div className="mt-10 flex items-center gap-6">
              {[
                { c: "var(--mastery-red)", key: "porAprender" },
                { c: "var(--mastery-amber)", key: "enProgreso" },
                { c: "var(--mastery-green)", key: "dominado" },
              ].map((s) => (
                <div key={s.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: s.c }} />
                  {t(s.key)}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl border border-border bg-card/50 p-8 backdrop-blur-sm">
              <div className="absolute left-4 top-4 flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-mastery-red/70" />
                <span className="size-2.5 rounded-full bg-mastery-amber/70" />
                <span className="size-2.5 rounded-full bg-mastery-green/70" />
              </div>
              <MiniTree />
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("featuresTitle")}
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            {t("featuresSubtitle")}
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group rounded-2xl border border-border bg-card/60 p-5 transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{t(f.titleKey)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card/40 p-6"
              >
                <span className="font-mono text-sm text-primary">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{t(s.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(s.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 pt-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card p-10 text-center sm:p-14">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("ctaSectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              {t("ctaSectionDesc")}
            </p>
            <Link
              href="/upload"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
            >
              <Upload className="size-4" />
              {t("ctaSectionBtn")}
            </Link>
          </div>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            {t("footer")}
          </p>
        </section>
      </div>
      <LocaleFooter />
    </div>
  )
}
