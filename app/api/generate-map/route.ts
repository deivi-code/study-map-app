import { NextResponse } from "next/server"
import { readPdfBuffer, resolveContent } from "@/lib/extract-text"
import { generateMapFromContent, generateMapFromPdf } from "@/lib/generate-map-ai"
import type { StudyMap } from "@/lib/types"
import { db } from "@/lib/db"
import { studyMap } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { checkRateLimit, getAnonymousLimit, getAuthenticatedLimit, getAuthenticatedPdfLimit } from "@/lib/auth/rate-limit"
import { enhanceErrorMessage, isKnownUserError, notifyUnexpectedError } from "@/lib/notify-error"

export const runtime = "nodejs"
export const maxDuration = 120

export async function POST(request: Request) {
  let userId: string | null = null
  let isAnonymousUser = true
  let source = "Apuntes"

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    userId = session?.user?.id || null
    isAnonymousUser = session?.user?.isAnonymous ?? true

    const formData = await request.formData()
    const text = (formData.get("text") as string | null) ?? ""
    source = (formData.get("source") as string | null) ?? "Apuntes"
    const file = formData.get("file") as File | null
    const isFile = file && file.size > 0
    const isPdf = isFile && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
    const isAuthenticated = !!userId && !isAnonymousUser
    const usePdfMultimodal = isPdf && isAuthenticated

    // Check rate limit
    let rateLimitInfo: { remaining: number; resetAt: Date } | null = null
    if (userId) {
      const [limit, actionKey] = usePdfMultimodal
        ? [await getAuthenticatedPdfLimit(), "create_map_pdf"]
        : [isAnonymousUser ? await getAnonymousLimit() : await getAuthenticatedLimit(), "create_map"]

      const rateLimitResult = await checkRateLimit(userId, actionKey, limit)

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

    let map: StudyMap
    let usedAi: boolean

    if (usePdfMultimodal) {
      const pdfBuffer = await readPdfBuffer(file)
      const result = await generateMapFromPdf(pdfBuffer, source)
      map = result.map
      usedAi = result.usedAi
    } else {
      const content = await resolveContent(text, isFile ? file : null)

      if (content.trim().length < 50) {
        return NextResponse.json(
          { error: "Proporciona más texto o un PDF con contenido suficiente." },
          { status: 400 },
        )
      }

      const result = await generateMapFromContent(content, source)
      map = result.map
      usedAi = result.usedAi
    }

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
    console.error("[api/generate-map]", err)

    if (isKnownUserError(err)) {
      return NextResponse.json(
        { error: enhanceErrorMessage(err, !userId || isAnonymousUser) },
        { status: 400 },
      )
    }

    await notifyUnexpectedError(err, {
      userId,
      source,
      isAuthenticated: !!userId && !isAnonymousUser,
      route: "api-generate-map",
    })

    return NextResponse.json(
      { error: "La IA a veces se equivoca. Vuelve a intentarlo o pega el texto de forma manual." },
      { status: 500 },
    )
  }
}
