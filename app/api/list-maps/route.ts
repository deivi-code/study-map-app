import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ maps: [] })
    }

    const userId = session.user.id

    const maps = await db
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

    // Get node count for each map
    const mapsWithMeta = await Promise.all(
      maps.map(async (map) => {
        const mapData = await db
          .select({ nodes: studyMap.nodes })
          .from(studyMap)
          .where(eq(studyMap.id, map.id))
          .then((rows) => rows[0])

        const nodeCount = mapData?.nodes ? (mapData.nodes as unknown as { length: number }).length || 0 : 0

        return {
          id: map.id,
          title: map.title,
          sourceType: map.sourceType,
          nodeCount,
          createdAt: map.createdAt.getTime(),
          updatedAt: map.updatedAt.getTime(),
        }
      })
    )

    return NextResponse.json({ maps: mapsWithMeta })
  } catch (err) {
    console.error("[api/list-maps]", err)
    return NextResponse.json(
      { error: "Error al listar los mapas" },
      { status: 500 },
    )
  }
}