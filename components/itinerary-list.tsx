"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Map, Calendar, Layers, Trash2, ChevronRight, Loader2, AlertCircle, FileQuestion } from "lucide-react"
import { useStudy } from "@/lib/store"
import { cn } from "@/lib/utils"

interface MapMeta {
  id: string
  title: string
  sourceType: string
  nodeCount: number
  createdAt: number
  updatedAt: number
}

interface ItineraryListProps {
  onClose: () => void
}

export function ItineraryList({ onClose }: ItineraryListProps) {
  const { user, loadMapById } = useStudy()
  const [maps, setMaps] = useState<MapMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const fetchMaps = useCallback(async () => {
    if (!user) return
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/list-maps")
      if (!res.ok) throw new Error("Error al cargar los mapas")
      const data = await res.json()
      setMaps(data.maps || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchMaps()
  }, [fetchMaps])

  const handleSelectMap = async (mapId: string) => {
    try {
      setLoadingId(mapId)
      await loadMapById(mapId)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el mapa")
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteMap = async (mapId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("¿Eliminar este itinerario? Esta acción no se puede deshacer.")) return
    
    try {
      setDeletingId(mapId)
      const res = await fetch(`/api/delete-map?mapId=${mapId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setMaps((prev) => prev.filter((m) => m.id !== mapId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el mapa")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
      />
      
      {/* Panel */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="relative z-10 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Map className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Mis itinerarios</h2>
              <p className="text-xs text-muted-foreground">{maps.length} mapa{maps.length !== 1 ? "s" : ""} guardado{maps.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="size-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Cargando itinerarios...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="size-8 text-destructive" />
                <p className="mt-3 text-sm text-destructive">{error}</p>
                <button
                  onClick={fetchMaps}
                  className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!isLoading && !error && maps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <FileQuestion className="size-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">Aún no tienes itinerarios</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Crea tu primer mapa de estudio desde la página de inicio.
                </p>
              </div>
            )}

            {!isLoading && !error && maps.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
                className="space-y-3"
              >
                {maps.map((map) => (
                  <motion.div
                    key={map.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className={cn(
                      "group relative rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card",
                      loadingId === map.id && "pointer-events-none opacity-70"
                    )}
                  >
                    {/* Map info */}
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => handleSelectMap(map.id)}
                        className="flex-1 text-left"
                        disabled={loadingId !== null}
                      >
                        <h3 className="font-medium leading-tight">{map.title}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {formatDate(map.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="size-3.5" />
                            {map.nodeCount} nodos
                          </span>
                        </div>
                        {map.sourceType && (
                          <span className="mt-2 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                            {map.sourceType}
                          </span>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="ml-3 flex items-center gap-1">
                        <button
                          onClick={() => handleSelectMap(map.id)}
                          disabled={loadingId !== null}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed"
                          title="Abrir mapa"
                        >
                          {loadingId === map.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteMap(map.id, e)}
                          disabled={deletingId !== null}
                          className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:cursor-not-allowed"
                          title="Eliminar mapa"
                        >
                          {deletingId === map.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        {!isLoading && !error && maps.length > 0 && (
          <footer className="border-t border-border p-4">
            <p className="text-center text-xs text-muted-foreground">
              Haz clic en un mapa para abrirlo
            </p>
          </footer>
        )}
      </motion.aside>
    </div>
  )
}