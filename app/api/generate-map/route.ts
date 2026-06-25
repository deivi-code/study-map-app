import { NextResponse } from "next/server"
import { resolveContent } from "@/lib/extract-text"
import { generateMapFromContent } from "@/lib/generate-map-ai"
import { db } from "@/lib/db"
import { studyMap } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkRateLimit, getAnonymousLimit, getAuthenticatedLimit } from "@/lib/auth/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const userId = session?.user?.id || null

    // Check rate limit
    if (userId && session) {
      const limit = session.user.isAnonymous ? await getAnonymousLimit() : await getAuthenticatedLimit()
      const rateLimitResult = await checkRateLimit(userId, "create_map", limit)
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            error: "Has alcanzado el límite de itinerarios. Intenta de nuevo más tarde.",
            resetAt: rateLimitResult.resetAt,
          },
          { status: 429 },
        )
      }
    }

    const formData = await request.formData()
    const text = (formData.get("text") as string | null) ?? ""
    const source = (formData.get("source") as string | null) ?? "Apuntes"
    const file = formData.get("file") as File | null

    const content = await resolveContent(text, file && file.size > 0 ? file : null)

    if (content.trim().length < 50) {
      return NextResponse.json(
        { error: "Proporciona más texto o un PDF con contenido suficiente." },
        { status: 400 },
      )
    }

    const { map, usedAi } = await generateMapFromContent(content, source)

    // Save to database if we have a user ID
    let savedMap = map
    if (userId) {
      const mapId = crypto.randomUUID()
      await db.insert(studyMap).values({
        id: mapId,
        userId,
        title: map.subject,
        sourceType: source,
        nodes: map.nodes,
      })
      savedMap = { ...map, id: mapId }
    }

    return NextResponse.json({ map: savedMap, usedAi })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar el mapa"
    console.error("[api/generate-map]", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
