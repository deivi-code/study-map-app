import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { studyMap, nodeProgress } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const runtime = "nodejs"

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 },
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const mapId = searchParams.get("mapId")

    if (!mapId) {
      return NextResponse.json(
        { error: "Se requiere mapId" },
        { status: 400 },
      )
    }

    // Verify ownership and delete
    const result = await db
      .delete(studyMap)
      .where(and(eq(studyMap.id, mapId), eq(studyMap.userId, userId)))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Mapa no encontrado o sin permisos" },
        { status: 404 },
      )
    }

    // Also delete associated progress
    await db
      .delete(nodeProgress)
      .where(eq(nodeProgress.mapId, mapId))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/delete-map]", err)
    return NextResponse.json(
      { error: "Error al eliminar el mapa" },
      { status: 500 },
    )
  }
}