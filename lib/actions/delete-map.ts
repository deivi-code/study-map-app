"use server"

import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap, nodeProgress } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function deleteMapAction(mapId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) return { success: false, error: "No autenticado" }

    const userId = session.user.id
    const result = await db
      .delete(studyMap)
      .where(and(eq(studyMap.id, mapId), eq(studyMap.userId, userId)))
      .returning()

    if (result.length === 0) return { success: false, error: "Mapa no encontrado o sin permisos" }

    await db.delete(nodeProgress).where(eq(nodeProgress.mapId, mapId))
    return { success: true }
  } catch (err) {
    console.error("[deleteMapAction]", err)
    return { success: false, error: "Error al eliminar el mapa" }
  }
}
