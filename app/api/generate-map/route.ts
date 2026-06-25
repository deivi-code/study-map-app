import { NextResponse } from "next/server"
import { resolveContent } from "@/lib/extract-text"
import { generateMapFromContent } from "@/lib/generate-map-ai"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({ map, usedAi })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al generar el mapa"
    console.error("[api/generate-map]", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
