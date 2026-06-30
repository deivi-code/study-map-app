import { NextResponse } from "next/server"
import { desc, eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap, nodeProgress, userStats } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { intToMastery } from "@/lib/study"
import type { KnowledgeNode, ProgressMap, StudyMap } from "@/lib/types"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ map: null, progress: {}, streak: 0 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const mapId = searchParams.get("mapId")

    let selectedMap = null
    if (mapId) {
      // Load specific map by ID
      const [map] = await db
        .select()
        .from(studyMap)
        .where(and(eq(studyMap.id, mapId), eq(studyMap.userId, userId)))
        .limit(1)
      selectedMap = map
    } else {
      // Load latest map (default behavior)
      const [map] = await db
        .select()
        .from(studyMap)
        .where(eq(studyMap.userId, userId))
        .orderBy(desc(studyMap.createdAt))
        .limit(1)
      selectedMap = map
    }

    let map: StudyMap | null = null
    if (selectedMap) {
      map = {
        id: selectedMap.id,
        subject: selectedMap.title,
        source: selectedMap.sourceType ?? "",
        createdAt: selectedMap.createdAt.getTime(),
        nodes: selectedMap.nodes as KnowledgeNode[],
      }
    }

    let progress: ProgressMap = {}
    if (selectedMap) {
      const progressRows = await db
        .select()
        .from(nodeProgress)
        .where(eq(nodeProgress.mapId, selectedMap.id))

      progress = Object.fromEntries(
        progressRows.map((row) => [
          row.nodeId,
          {
            score: row.bestScore,
            mastery: intToMastery(row.mastery),
            attempts: row.attempts,
          },
        ]),
      )
    }

    let streak = 0
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))

    if (stats) {
      streak = stats.streak
    }

    return NextResponse.json({ map, progress, streak })
  } catch (err) {
    console.error("[api/load-state]", err)
    return NextResponse.json(
      { error: "Error al cargar el estado" },
      { status: 500 },
    )
  }
}
