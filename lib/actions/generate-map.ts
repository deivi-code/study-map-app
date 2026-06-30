"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { studyMap } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { resolveContent } from "@/lib/extract-text"
import { generateMapFromContent } from "@/lib/generate-map-ai"
import { checkRateLimit, getAnonymousLimit, getAuthenticatedLimit } from "@/lib/auth/rate-limit"

export async function generateMapAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id || null

    if (userId && session) {
      const limit = session.user.isAnonymous ? await getAnonymousLimit() : await getAuthenticatedLimit()
      const rateLimitResult = await checkRateLimit(userId, "create_map", limit)
      if (!rateLimitResult.allowed) {
        const resetStr = rateLimitResult.resetAt.toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        })
        return { error: `Has alcanzado el límite de ${limit} itinerarios. Podrás crear más a partir del ${resetStr}.` }
      }
    }

    const text = (formData.get("text") as string | null) ?? ""
    const source = (formData.get("source") as string | null) ?? "Apuntes"
    const file = formData.get("file") as File | null

    const content = await resolveContent(text, file && file.size > 0 ? file : null)

    if (content.trim().length < 50) {
      return { error: "Proporciona más texto o un PDF con contenido suficiente." }
    }

    const { map } = await generateMapFromContent(content, source)

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
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}
