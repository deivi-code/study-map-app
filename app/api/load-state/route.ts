import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap, nodeProgress, userStats } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { KnowledgeNode, ProgressMap, StudyMap } from "@/lib/types"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ map: null, progress: {}, streak: 0 })
    }

    const userId = session.user.id

    const [latestMap] = await db
      .select()
      .from(studyMap)
      .where(eq(studyMap.userId, userId))
      .orderBy(desc(studyMap.createdAt))
      .limit(1)

    let map: StudyMap | null = null
    if (latestMap) {
      map = {
        id: latestMap.id,
        subject: latestMap.title,
        source: latestMap.sourceType ?? "",
        createdAt: latestMap.createdAt.getTime(),
        nodes: latestMap.nodes as KnowledgeNode[],
      }
    }

    let progress: ProgressMap = {}
    if (latestMap) {
      const progressRows = await db
        .select()
        .from(nodeProgress)
        .where(eq(nodeProgress.mapId, latestMap.id))

      progress = Object.fromEntries(
        progressRows.map((row) => [
          row.nodeId,
          {
            score: row.bestScore,
            mastery: row.mastery as ProgressMap[string]["mastery"],
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
