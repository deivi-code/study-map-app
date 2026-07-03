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
    let rateLimitInfo: { remaining: number; resetAt: Date } | null = null
    if (userId && session) {
      const limit = session.user.isAnonymous ? await getAnonymousLimit() : await getAuthenticatedLimit()
      const rateLimitResult = await checkRateLimit(userId, "create_map", limit)

      if (!rateLimitResult.allowed) {
        const resetStr = rateLimitResult.resetAt.toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        })
        return NextResponse.json(
          {
            error: `Has alcanzado el límite de ${limit} itinerarios. Podrás crear más a partir del ${resetStr}.`,
            resetAt: rateLimitResult.resetAt,
            remaining: 0,
          },
          { status: 429 },
        )
      }

      rateLimitInfo = {
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.resetAt,
      }
    }

    const formData = await request.formData()
    const text = (formData.get("text") as string | null) ?? ""
    const source = (formData.get("source") as string | null) ?? "Apuntes"
    const locale = (formData.get("locale") as string | null) ?? "es"
    const file = formData.get("file") as File | null

    const content = await resolveContent(text, file && file.size > 0 ? file : null)

    if (content.trim().length < 50) {
      return NextResponse.json(
        { error: "Proporciona más texto o un PDF con contenido suficiente." },
        { status: 400 },
      )
    }

    const { map, usedAi } = await generateMapFromContent(content, source, locale)

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

    return NextResponse.json({
      map: savedMap,
      usedAi,
      remaining: rateLimitInfo?.remaining ?? null,
      resetAt: rateLimitInfo?.resetAt ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar el mapa"
    console.error("[api/generate-map]", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
