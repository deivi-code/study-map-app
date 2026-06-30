import { desc, eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap, nodeProgress, userStats } from "@/lib/db/schema"
import { intToMastery } from "@/lib/study"
import type { KnowledgeNode, ProgressMap, StudyMap } from "@/lib/types"

export interface MapData {
  map: StudyMap | null
  progress: ProgressMap
  streak: number
}

export async function fetchMapData(mapId: string, userId: string): Promise<MapData> {
  const [map] = await db
    .select()
    .from(studyMap)
    .where(and(eq(studyMap.id, mapId), eq(studyMap.userId, userId)))
    .limit(1)

  if (!map) return { map: null, progress: {}, streak: 0 }

  const result: StudyMap = {
    id: map.id,
    subject: map.title,
    source: map.sourceType ?? "",
    createdAt: map.createdAt.getTime(),
    nodes: map.nodes as KnowledgeNode[],
  }

  const progressRows = await db
    .select()
    .from(nodeProgress)
    .where(eq(nodeProgress.mapId, mapId))

  const progress: ProgressMap = Object.fromEntries(
    progressRows.map((row) => [
      row.nodeId,
      { score: row.bestScore, mastery: intToMastery(row.mastery), attempts: row.attempts },
    ]),
  )

  let streak = 0
  const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId))
  if (stats) streak = stats.streak

  return { map: result, progress, streak }
}

export async function fetchLatestMap(userId: string): Promise<MapData> {
  const [map] = await db
    .select()
    .from(studyMap)
    .where(eq(studyMap.userId, userId))
    .orderBy(desc(studyMap.createdAt))
    .limit(1)

  if (!map) return { map: null, progress: {}, streak: 0 }

  return fetchMapData(map.id, userId)
}
