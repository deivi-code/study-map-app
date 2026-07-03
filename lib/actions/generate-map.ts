"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { studyMap } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { readPdfBuffer, resolveContent } from "@/lib/extract-text"
import { generateMapFromContent, generateMapFromPdf } from "@/lib/generate-map-ai"
import type { StudyMap } from "@/lib/types"
import { checkRateLimit, getAnonymousLimit, getAuthenticatedLimit, getAuthenticatedPdfLimit } from "@/lib/auth/rate-limit"
import { enhanceErrorMessage, isKnownUserError, notifyUnexpectedError } from "@/lib/notify-error"

export async function generateMapAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  let userId: string | null = null
  let isAnonymousUser = true
  let source = "Apuntes"

  try {
    const session = await auth.api.getSession({ headers: await headers() })
    userId = session?.user?.id || null
    isAnonymousUser = session?.user?.isAnonymous ?? true

    const text = (formData.get("text") as string | null) ?? ""
    source = (formData.get("source") as string | null) ?? "Apuntes"
    const file = formData.get("file") as File | null
    const isFile = file && file.size > 0
    const isPdf = isFile && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
    const isAuthenticated = !!userId && !isAnonymousUser
    const usePdfMultimodal = isPdf && isAuthenticated

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
        return { error: `Has alcanzado el límite de ${limit} itinerarios. Podrás crear más a partir del ${resetStr}.` }
      }
    }

    let map: StudyMap

    if (usePdfMultimodal) {
      const pdfBuffer = await readPdfBuffer(file)
      const result = await generateMapFromPdf(pdfBuffer, source)
      map = result.map
    } else {
      const content = await resolveContent(text, isFile ? file : null)

      if (content.trim().length < 50) {
        return { error: "Proporciona más texto o un PDF con contenido suficiente." }
      }

      const result = await generateMapFromContent(content, source)
      map = result.map
    }

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

    redirect(`/app/${savedMap.id}`)
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err
    console.error("[generateMapAction]", err)

    if (isKnownUserError(err)) {
      return { error: enhanceErrorMessage(err, !userId || isAnonymousUser) }
    }

    await notifyUnexpectedError(err, {
      userId,
      source,
      isAuthenticated: !!userId && !isAnonymousUser,
      route: "server-action-generate-map",
    })

    return { error: "La IA a veces se equivoca. Vuelve a intentarlo o pega el texto de forma manual." }
  }
}
