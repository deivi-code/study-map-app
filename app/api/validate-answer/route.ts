import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateObject, generateText, Output } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

export const runtime = "nodejs"
export const maxDuration = 30

const requestSchema = z.object({
  question: z.string().min(1),
  hint: z.string(),
  userAnswer: z.string().min(1),
  acceptedAnswers: z.array(z.string()).min(1),
  context: z.string().optional(),
})

const responseSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json())
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        correct: false,
        feedback: "Revisión con IA no disponible. Comprueba el formato indicado en la pista.",
      })
    }

    const google = createGoogleGenerativeAI({ apiKey })
    const modelId = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"

    const { output } = await generateText({
      model: google(modelId),
      output: Output.object({
        schema: responseSchema
      }),
      system: `Eres un corrector de respuestas cortas en español. Evalúa si la respuesta del estudiante es correcta en significado, aunque difiera en redacción, tildes o mayúsculas. Sé justo pero no aceptes respuestas incorrectas. Responde en español.`,
      prompt: `Pregunta: ${body.question}
Pista de formato: ${body.hint}
Respuestas aceptadas de referencia: ${body.acceptedAnswers.join(" | ")}
${body.context ? `Contexto: ${body.context}` : ""}

Respuesta del estudiante: "${body.userAnswer}"

¿Es correcta en esencia?`,
      temperature: 0.2,
    })

    return NextResponse.json(output)
  } catch (err) {
    console.error("[api/validate-answer]", err)
    return NextResponse.json(
      { correct: false, feedback: "No se pudo revisar la respuesta. Inténtalo de nuevo." },
      { status: 500 },
    )
  }
}
