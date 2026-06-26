"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, FileText, Loader as Loader2, Sparkles, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useStudy } from "@/lib/store"
import { loaderSteps } from "@/lib/study"
import { Logo, ThemeToggle } from "./brand"

export function UploadScreen() {
  const {
    setView,
    generate,
    isGenerating,
    generateError,
    clearGenerateError,
    user,
    rateLimitRemaining,
  } = useStudy()
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const canGenerate = text.trim().length > 8 || !!file
  const isAnonymous = !user || user.isAnonymous
  const maxItineraries = isAnonymous ? 3 : 10
  const remaining = rateLimitRemaining
  const lowThreshold = isAnonymous ? 1 : 3

  useEffect(() => {
    if (!isGenerating) return
    setStepIndex(0)
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, loaderSteps.length - 1))
    }, 2500)
    return () => clearInterval(interval)
  }, [isGenerating])

  function handleFile(selected: File | undefined) {
    if (!selected) return
    clearGenerateError()
    setFile(selected)
  }

  function clearFile() {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function runGeneration() {
    if (!canGenerate || isGenerating) return
    clearGenerateError()

    try {
      await generate({
        text,
        source: file?.name ?? "Apuntes pegados",
        file,
      })
      setView("app")
    } catch {
      // generateError is set in the store
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(50%_80%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]" />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <button
          onClick={() => setView("landing")}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </button>
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <AnimatePresence mode="wait">
          {!isGenerating ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Sube tus apuntes
              </h1>
              <p className="mt-2 text-muted-foreground">
                Arrastra un PDF o pega tu texto. Construiremos tu mapa de conocimiento.
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  handleFile(e.dataTransfer.files?.[0])
                }}
                className={`mt-8 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                  dragging ? "border-primary bg-primary/10" : "border-border bg-card/40"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <FileText className="size-5" />
                    </span>
                    <span className="max-w-[200px] truncate text-sm font-medium">{file.name}</span>
                    <button
                      onClick={clearFile}
                      aria-label="Quitar archivo"
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                      <Upload className="size-6" />
                    </span>
                    <p className="mt-4 text-sm font-medium">
                      Arrastra tu PDF aquí o{" "}
                      <button
                        onClick={() => inputRef.current?.click()}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        selecciona un archivo
                      </button>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, TXT, MD · máx. 5 MB</p>
                  </>
                )}
              </div>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">o pega texto</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <textarea
                value={text}
                onChange={(e) => {
                  clearGenerateError()
                  setText(e.target.value)
                }}
                placeholder="Pega aquí tus apuntes de biología, historia, programación…"
                className="min-h-40 w-full resize-y rounded-2xl border border-border bg-card/40 p-4 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60"
              />

              {generateError && (
                <p className="mt-4 rounded-xl border border-mastery-red/40 bg-mastery-red/10 px-4 py-3 text-sm text-mastery-red">
                  {generateError}
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                <span
                  className={
                    remaining === 0
                      ? "font-medium text-mastery-red"
                      : remaining <= lowThreshold
                        ? "font-medium text-mastery-amber"
                        : "text-muted-foreground"
                  }
                >
                  {remaining === 0
                    ? `Límite alcanzado. Podrás crear más itinerarios más tarde.`
                    : `Te quedan ${remaining} de ${maxItineraries} itinerarios${
                        isAnonymous ? " (modo invitado)" : ""
                      }`}
                </span>
              </div>

              <button
                onClick={runGeneration}
                disabled={!canGenerate || remaining === 0}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="size-4" />
                Generar mapa
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Analizamos tus apuntes con IA para crear un mapa personalizado.
              </p>
            </motion.div>
          ) : (
            <Loader stepIndex={stepIndex} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function Loader({ stepIndex }: { stepIndex: number }) {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative grid size-28 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border border-primary/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <span className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
          <Loader2 className="size-7 animate-spin" />
        </span>
      </div>

      <h2 className="mt-8 text-xl font-semibold">La IA está pensando…</h2>

      <div className="mt-6 w-full max-w-sm space-y-2.5">
        {loaderSteps.map((step, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "idle"
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: state === "idle" ? 0.4 : 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3.5 py-2.5 text-left text-sm"
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${
                  state === "done"
                    ? "bg-mastery-green/20 text-mastery-green"
                    : state === "active"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {state === "done" ? "✓" : state === "active" ? <Loader2 className="size-3 animate-spin" /> : i + 1}
              </span>
              <span className={state === "idle" ? "text-muted-foreground" : ""}>{step}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
