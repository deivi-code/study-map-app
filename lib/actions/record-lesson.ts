"use server"

import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { nodeProgress, userStats } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { masteryFromScore, masteryToInt } from "@/lib/study"

export async function recordLessonAction(
  mapId: string,
  nodeId: string,
  score: number,
): Promise<{ success: boolean }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false }

    const userId = session.user.id
    const mastery = masteryFromScore(score)

    // Upsert progress
    const existing = await db
      .select()
      .from(nodeProgress)
      .where(and(eq(nodeProgress.mapId, mapId), eq(nodeProgress.nodeId, nodeId)))
      .limit(1)

    const masteryInt = masteryToInt(mastery)

    if (existing.length > 0) {
      const prev = existing[0]
      const bestScore = Math.max(prev.bestScore, score)
      await db
        .update(nodeProgress)
        .set({ bestScore, mastery: masteryInt, attempts: prev.attempts + 1 })
        .where(eq(nodeProgress.id, prev.id))
    } else {
      await db.insert(nodeProgress).values({
        id: crypto.randomUUID(),
        userId,
        mapId,
        nodeId,
        status: "completed",
        bestScore: score,
        mastery: masteryInt,
        attempts: 1,
      })
    }

    // Update streak
    const today = new Date().toISOString().slice(0, 10)
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId))
    if (stats) {
      await db
        .update(userStats)
        .set({ streak: stats.streak + 1, lastActiveDate: today })
        .where(eq(userStats.userId, userId))
    } else {
      await db.insert(userStats).values({ userId, streak: 1, lastActiveDate: today })
    }

    return { success: true }
  } catch (err) {
    console.error("[recordLessonAction]", err)
    return { success: false }
  }
}
