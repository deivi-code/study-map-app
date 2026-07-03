import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, Output } from "ai"
import { extractText, getDocumentProxy } from "unpdf"
import { buildUserPrompt, buildPdfUserPrompt, SYSTEM_PROMPT } from "./prompts"
import {
  llmStudyMapSchema,
  toStudyMap,
  validateStudyMapGraph,
  type LlmStudyMap,
} from "./schemas"
import { generateStudyMap } from "./study"
import type { StudyMap } from "./types"
const MIN_CONTENT_LENGTH = 50
const DEFAULT_MODEL = "gemini-3.1-flash-lite"
const PDF_MODEL = "gemini-2.5-flash"

export function extractZodRetryMessage(err: unknown): string | null {
  function findZodError(e: unknown): unknown {
    if (!e || typeof e !== "object") return null
    const obj = e as Record<string, unknown>
    if (Array.isArray(obj.issues)) return e
    if ("cause" in obj) return findZodError(obj.cause)
    return null
  }

  const zodError = findZodError(err)
  if (!zodError) return null

  const issues = (zodError as { issues: Array<{ path: (string | number)[]; message: string }> }).issues
  if (!issues.length) return null

  return issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `"${issue.path.join(".")}": ` : ""
      return `${path}${issue.message}`
    })
    .join(". ")
}

function getGeminiApiKey(): string | undefined {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY
}

function getGeminiModel() {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return null

  const google = createGoogleGenerativeAI({ apiKey })
  const modelId = process.env.GEMINI_MODEL ?? DEFAULT_MODEL
  return google(modelId)
}

export async function generateMapFromContent(
  content: string,
  source: string,
): Promise<{ map: StudyMap; usedAi: boolean }> {
  if (content.trim().length < MIN_CONTENT_LENGTH) {
    throw new Error("El contenido es demasiado corto para generar un mapa (mínimo ~50 caracteres)")
  }

  if (!getGeminiApiKey()) {
    return { map: generateStudyMap({ text: content, source }), usedAi: false }
  }

  try {
    const llm = await callLlm(content)
    console.log("[generate-map-ai] llm:", llm)
    const graphError = validateStudyMapGraph(llm.nodes)
    if (graphError) {
      const retried = await callLlm(content, graphError)
      const retryError = validateStudyMapGraph(retried.nodes)
      if (retryError) throw new Error(retryError)
      return { map: toStudyMap(retried, source), usedAi: true }
    }
    return { map: toStudyMap(llm, source), usedAi: true }
  } catch (err) {
    const zodMsg = extractZodRetryMessage(err)
    if (zodMsg) {
      try {
        const retried = await callLlm(content, zodMsg)
        const retryError = validateStudyMapGraph(retried.nodes)
        if (retryError) throw new Error(retryError)
        return { map: toStudyMap(retried, source), usedAi: true }
      } catch (retryErr) {
        console.error("[generate-map-ai] retry with Zod feedback also failed:", retryErr)
      }
    }

    console.error("[generate-map-ai] fallback to templates:", err)
    return { map: generateStudyMap({ text: content, source }), usedAi: false }
  }
}

async function callLlm(content: string, retryError?: string): Promise<LlmStudyMap> {
  const model = getGeminiModel()
  if (!model) throw new Error("Gemini API key no configurada")

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: llmStudyMapSchema,
    }),
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(content, retryError),
    temperature: 0.4,
  })

  return output as LlmStudyMap
}

function getPdfGeminiModel() {
  const apiKey = getGeminiApiKey()
  if (!apiKey) return null

  const google = createGoogleGenerativeAI({ apiKey })
  const modelId = process.env.GEMINI_PDF_MODEL ?? PDF_MODEL
  return google(modelId)
}

async function extractTextFromPdfBuffer(buffer: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(buffer)
  const { text } = await extractText(pdf, { mergePages: true })
  const trimmed = text.trim()
  if (trimmed.length < 20) {
    throw new Error("No se pudo extraer texto del PDF. ¿Es un PDF escaneado?")
  }
  return trimmed
}

async function callLlmWithPdf(pdfBuffer: Uint8Array, retryError?: string): Promise<LlmStudyMap> {
  const model = getPdfGeminiModel()
  if (!model) throw new Error("Gemini API key no configurada")

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: llmStudyMapSchema,
    }),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildPdfUserPrompt(retryError) },
          { type: "file", data: pdfBuffer, mediaType: "application/pdf" },
        ],
      },
    ],
    temperature: 0.4,
  })

  return output as LlmStudyMap
}

export async function generateMapFromPdf(
  pdfBuffer: Uint8Array,
  source: string,
): Promise<{ map: StudyMap; usedAi: boolean }> {
  if (!getGeminiApiKey()) {
    const content = await extractTextFromPdfBuffer(pdfBuffer)
    return { map: generateStudyMap({ text: content, source }), usedAi: false }
  }

  try {
    const llm = await callLlmWithPdf(pdfBuffer)
    console.log("[generate-map-ai] pdf llm:", llm)
    const graphError = validateStudyMapGraph(llm.nodes)
    if (graphError) {
      const retried = await callLlmWithPdf(pdfBuffer, graphError)
      const retryError = validateStudyMapGraph(retried.nodes)
      if (retryError) throw new Error(retryError)
      return { map: toStudyMap(retried, source), usedAi: true }
    }
    return { map: toStudyMap(llm, source), usedAi: true }
  } catch (err) {
    const zodMsg = extractZodRetryMessage(err)
    if (zodMsg) {
      try {
        const retried = await callLlmWithPdf(pdfBuffer, zodMsg)
        const retryError = validateStudyMapGraph(retried.nodes)
        if (retryError) throw new Error(retryError)
        return { map: toStudyMap(retried, source), usedAi: true }
      } catch (retryErr) {
        console.error("[generate-map-ai] pdf retry with Zod feedback also failed:", retryErr)
      }
    }

    console.error("[generate-map-ai] pdf fallback to text templates:", err)
    const content = await extractTextFromPdfBuffer(pdfBuffer)
    return { map: generateStudyMap({ text: content, source }), usedAi: false }
  }
}
