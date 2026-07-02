import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText, Output } from "ai"
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompts"
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
