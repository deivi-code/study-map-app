import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap, nodeProgress, userStats } from "@/lib/db/schema"

export async function migrateAnonymousData(
  anonymousUserId: string,
  authenticatedUserId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(studyMap)
      .set({ userId: authenticatedUserId })
      .where(eq(studyMap.userId, anonymousUserId))

    await tx
      .update(nodeProgress)
      .set({ userId: authenticatedUserId })
      .where(eq(nodeProgress.userId, anonymousUserId))

    await tx
      .update(userStats)
      .set({ userId: authenticatedUserId })
      .where(eq(userStats.userId, anonymousUserId))
  })
}
