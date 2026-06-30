"use client"

import { StudyProvider } from "@/lib/store"
import type { MapData } from "@/lib/fetch-map-data"

export function MapContextWrapper({
  mapData,
  children,
}: {
  mapData: MapData | null
  children: React.ReactNode
}) {
  return (
    <StudyProvider
      initialMap={mapData?.map ?? null}
      initialProgress={mapData?.progress ?? {}}
      initialStreak={mapData?.streak ?? 0}
    >
      {children}
    </StudyProvider>
  )
}
