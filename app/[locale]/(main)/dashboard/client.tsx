"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Map, Calendar, Layers, Trash2, ChevronRight, Loader2, AlertCircle, FileQuestion, TrendingUp, Target, CheckCircle2, Flame } from "lucide-react"
import { useTranslations, useLocale } from 'next-intl'
import { deleteMapAction } from "@/lib/actions/delete-map"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface MapMeta {
  id: string
  title: string
  sourceType: string
  nodeCount: number
  createdAt: number
  updatedAt: number
}

interface SnapshotData {
  mapId: string
  title: string
  overall: number
  streak: number
  weakCount: number
  totalNodes: number
  greenNodes: number
  lockedNodes: number
}

export function DashboardClient({
  maps,
  latestSnapshot,
}: {
  maps: MapMeta[]
  latestSnapshot: SnapshotData | null
}) {
  const router = useRouter()
  const t = useTranslations('dashboardPage')
  const locale = useLocale()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteMap = async (mapId: string) => {
    if (!confirm(t('deleteConfirm'))) return
    try {
      setDeletingId(mapId)
      const result = await deleteMapAction(mapId)
      if (!result.success) throw new Error(result.error ?? t('deleteError'))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteError'))
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>

      {/* Snapshot */}
      {latestSnapshot && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/8 to-card"
        >
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('whereYouLeft')}
              </h2>
              <h3 className="mt-2 text-xl font-semibold">{latestSnapshot.title}</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SnapshotStat icon={TrendingUp} label={t('totalMastery')} value={`${latestSnapshot.overall}%`} />
                <SnapshotStat icon={CheckCircle2} label={t('nodesMastered')} value={`${latestSnapshot.greenNodes}/${latestSnapshot.totalNodes}`} color="var(--mastery-green)" />
                <SnapshotStat icon={Target} label={t('weakNodes')} value={`${latestSnapshot.weakCount}`} color="var(--mastery-amber)" />
                <SnapshotStat icon={Flame} label={t('streak')} value={`${latestSnapshot.streak}`} suffix="" />
              </div>
            </div>
            <div className="flex items-end">
              <Link
                href={`/${locale}/app/${latestSnapshot.mapId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
              >
                {t('continue')}
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {maps.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12 flex flex-col items-center justify-center py-16 text-center"
        >
          <FileQuestion className="size-16 text-muted-foreground/40" />
          <h3 className="mt-6 text-xl font-semibold">{t('emptyTitle')}</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            {t('emptyDesc')}
          </p>
          <Link
            href={`/${locale}/upload`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
          >
            {t('uploadNotes')}
          </Link>
        </motion.div>
      )}

      {/* Itinerary list */}
      {maps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold tracking-tight">{t('myItineraries')}</h2>
          <p className="text-sm text-muted-foreground">{maps.length} {t('mapsCount')}</p>

          {error && (
            <p className="mt-3 rounded-xl border border-mastery-red/40 bg-mastery-red/10 px-4 py-3 text-sm text-mastery-red">
              {error}
            </p>
          )}

          <div className="mt-4 space-y-3">
            {maps.map((map, i) => (
              <motion.div
                key={map.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="group relative rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-start justify-between">
                  <Link
                    href={`/${locale}/app/${map.id}`}
                    className="flex-1"
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
                  </Link>
                  <div className="ml-3 flex items-center gap-1">
                    <Link
                      href={`/${locale}/app/${map.id}`}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/15 hover:text-primary"
                      title={t('openMap')}
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteMap(map.id)}
                      disabled={deletingId !== null}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:cursor-not-allowed"
                      title={t('deleteMap')}
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
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SnapshotStat({
  icon: Icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: React.ElementType
  label: string
  value: string
  color?: string
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg"
        style={{ background: color ? `color-mix(in oklch, ${color} 16%, transparent)` : "var(--muted)", color: color ?? "var(--foreground)" }}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-lg font-semibold tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
