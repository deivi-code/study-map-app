import { Resend } from "resend"

const DEV_EMAIL = "davidgrcdiaz@gmail.com"

const KNOWN_ERROR_PREFIXES = [
  "El archivo supera el límite",
  "Formato no soportado",
  "No se pudo extraer texto del PDF",
  "El contenido es demasiado corto",
  "Gemini API key no configurada",
]

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export function isKnownUserError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return KNOWN_ERROR_PREFIXES.some((prefix) => error.message.startsWith(prefix))
}

export function enhanceErrorMessage(error: unknown, isAnonymous: boolean): string {
  const msg = error instanceof Error ? error.message : "Error desconocido"

  if (isAnonymous && msg.includes("No se pudo extraer texto del PDF")) {
    return `${msg} Inicia sesión para analizar también diagramas y esquemas.`
  }

  return msg
}

export async function notifyUnexpectedError(
  error: unknown,
  context: {
    userId?: string | null
    source?: string
    isAuthenticated?: boolean
    route: string
  },
): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[notifyUnexpectedError] RESEND_API_KEY not configured, skipping email")
      return
    }

    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : "No stack trace"

    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@studymap.naria.es",
      to: DEV_EMAIL,
      subject: `[Study Map Error] ${message.slice(0, 80)}`,
      html: `
        <h2>Error inesperado en Study Map</h2>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;overflow:auto;font-size:13px;">
Route:          ${context.route}
Timestamp:      ${new Date().toISOString()}
UserId:         ${context.userId ?? "none"}
Authenticated:  ${context.isAuthenticated ?? false}
Source:         ${context.source ?? "unknown"}
Error:          ${message}
Stack:
${stack}
        </pre>
      `,
    })
  } catch (emailErr) {
    console.error("[notifyUnexpectedError] Failed to send notification email:", emailErr)
  }
}
