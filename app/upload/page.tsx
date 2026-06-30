"use client"

import { useRef, useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { ArrowLeft, FileText, Loader2, Sparkles, Upload, X } from "lucide-react"
import { generateMapAction } from "@/lib/actions/generate-map"
import { Logo, ThemeToggle } from "@/components/brand"
import Link from "next/link"

function SubmitButton({ canGenerate }: { canGenerate: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={!canGenerate || pending}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {pending ? "Generando…" : "Generar mapa"}
    </button>
  )
}

export default function UploadPage() {
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [state, formAction] = useActionState(generateMapAction, {})
  const inputRef = useRef<HTMLInputElement>(null)

  const canGenerate = text.trim().length > 8 || !!file

  function handleFile(selected: File | undefined) {
    if (!selected) return
    setFile(selected)
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(50%_80%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]" />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Sube tus apuntes</h1>
        <p className="mt-2 text-muted-foreground">
          Arrastra un PDF o pega tu texto. Construiremos tu mapa de conocimiento.
        </p>

        <form action={formAction}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }}
            className={`mt-8 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-primary bg-primary/10" : "border-border bg-card/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              name="file"
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
                  type="button"
                  onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = "" }}
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
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    selecciona un archivo
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PDF, TXT, MD · máx. 5 MB</p>
              </>
            )}
            <input type="hidden" name="source" value={file?.name ?? "Apuntes pegados"} />
          </div>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">o pega texto</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <textarea
            name="text"
            value={text}
            onChange={(e) => { setText(e.target.value) }}
            placeholder="Pega aquí tus apuntes de biología, historia, programación…"
            className="min-h-40 w-full resize-y rounded-2xl border border-border bg-card/40 p-4 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60"
          />

          {state?.error && (
            <p className="mt-4 rounded-xl border border-mastery-red/40 bg-mastery-red/10 px-4 py-3 text-sm text-mastery-red">
              {state.error}
            </p>
          )}

          <SubmitButton canGenerate={canGenerate} />
        </form>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Analizamos tus apuntes con IA para crear un mapa personalizado.
        </p>
      </main>
    </div>
  )
}
