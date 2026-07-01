import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap } from "@/lib/db/schema"
import { fetchLatestMap, type MapData } from "@/lib/fetch-map-data"
import { computeStats } from "@/lib/study"
import type { StudyMap } from "@/lib/types"
import { DashboardClient } from "./client"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    return <DashboardClient maps={[]} latestSnapshot={null} />
  }

  const latest = await fetchLatestMap(userId)

  const allMaps = await db
    .select({
      id: studyMap.id,
      title: studyMap.title,
      sourceType: studyMap.sourceType,
      createdAt: studyMap.createdAt,
      updatedAt: studyMap.updatedAt,
    })
    .from(studyMap)
    .where(eq(studyMap.userId, userId))
    .orderBy(desc(studyMap.createdAt))

  const mapsWithMeta = await Promise.all(
    allMaps.map(async (m) => {
      const mapData = await db
        .select({ nodes: studyMap.nodes })
        .from(studyMap)
        .where(eq(studyMap.id, m.id))
        .then((rows) => rows[0])
      const nodeCount = mapData?.nodes ? (mapData.nodes as unknown as { length: number }).length || 0 : 0
      return {
        id: m.id,
        title: m.title,
        sourceType: m.sourceType ?? "",
        nodeCount,
        createdAt: m.createdAt.getTime(),
        updatedAt: m.updatedAt.getTime(),
      }
    }),
  )

  let snapshot = null
  if (latest.map) {
    const stats = computeStats(latest.map as StudyMap, latest.progress)
    snapshot = {
      mapId: latest.map.id,
      title: latest.map.subject,
      overall: stats.overall,
      streak: latest.streak,
      weakCount: stats.weak.length,
      totalNodes: stats.total,
      greenNodes: stats.green,
      lockedNodes: stats.locked,
    }
  }

  return <DashboardClient maps={mapsWithMeta} latestSnapshot={snapshot} />
}
