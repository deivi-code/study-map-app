"use client"

import { useRef, useContext } from "react"
import { Download, Upload } from "lucide-react"
import { StudyContext } from "@/lib/store"
import { useTranslations } from 'next-intl'

export function ExportImport() {
  const t = useTranslations('exportImport')
  const ctx = useContext(StudyContext)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!ctx?.map) return null
  const { map, progress, streak, setMap, setProgress, setStreak } = ctx

  function handleExport() {
    if (!map) return
    const data = JSON.stringify({ map, progress, streak, exportedAt: new Date().toISOString() }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `estudio-${map.subject}-${map.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data?.map?.nodes && data?.progress) {
          setMap(data.map)
          setProgress(data.progress)
          if (typeof data.streak === "number") setStreak(data.streak)
        }
      } catch { /* invalid file */ }
    }
    reader.readAsText(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-hidden="true" />
      <button
        type="button"
        onClick={handleExport}
        className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label={t('exportAria')}
      >
        <Download className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label={t('importAria')}
      >
        <Upload className="size-4" />
      </button>
    </>
  )
}
