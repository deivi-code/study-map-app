import { extractText, getDocumentProxy } from "unpdf"

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("El archivo supera el límite de 5 MB")
  }

  const type = file.type
  const name = file.name.toLowerCase()

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdfText(file)
  }

  if (type === "text/plain" || name.endsWith(".txt") || name.endsWith(".md")) {
    return file.text()
  }

  throw new Error("Formato no soportado. Usa PDF, TXT o MD.")
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer())
  const pdf = await getDocumentProxy(buffer)
  const { text } = await extractText(pdf, { mergePages: true })
  const trimmed = text.trim()
  if (trimmed.length < 20) {
    throw new Error("No se pudo extraer texto del PDF. ¿Es un PDF escaneado?")
  }
  return trimmed
}

export async function resolveContent(text: string, file: File | null): Promise<string> {
  const trimmed = text.trim()
  if (file) {
    const fileText = await extractTextFromFile(file)
    return trimmed ? `${trimmed}\n\n${fileText}` : fileText
  }
  return trimmed
}
