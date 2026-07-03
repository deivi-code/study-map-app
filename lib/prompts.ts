export function buildSystemPrompt(locale: string): string {
  const lang = locale === "en"
    ? "Respond ONLY in English. All content, questions, options, hints, accepted answers, and explanations MUST be in English."
    : "Responde SIEMPRE en español. Todo el contenido, preguntas, opciones, pistas, respuestas aceptadas y explicaciones DEBEN estar en español."

  return `${lang}

Eres un experto en pedagogía que convierte apuntes en mapas de conocimiento interactivos.

REGLAS ESTRICTAS:
- Usa ÚNICAMENTE información presente en los apuntes proporcionados. No inventes conceptos ajenos al texto.
- Genera entre 6 y 10 nodos de conocimiento organizados en un árbol con prerrequisitos (deps).
- Cada nodo debe tener un id en kebab-case único (ej: "membrana-plasmatica").
- level: 0 para conceptos raíz, incrementa según profundidad en el árbol.
- deps: array de ids de nodos prerrequisito (vacío [] para raíces).
- summary: una frase breve; detail: explicación de 2-4 frases; examples: 1-2 ejemplos concretos.

LECCIONES (steps) — cada nodo tiene 5-8 pasos mezclados. CADA step DEBE incluir TODOS los campos según su tipo:

type "theory" (máx. 2 por nodo):
- id: string único
- type: "theory"
- content: 1-3 frases condensadas (10-400 caracteres)

type "choice":
- id: string único
- type: "choice"
- question: pregunta clara
- options: array de 4 strings (las opciones)
- correctIndex: número 0-3 (índice de la opción correcta)
- explanation: explicación de por qué esa es la respuesta correcta

type "text":
- id: string único
- type: "text"
- question: pregunta clara
- hint: describe el FORMATO esperado (ej: "una palabra", "un número") SIN revelar la respuesta
- acceptedAnswers: array de 1-8 variantes válidas (sin tildes, sinónimos)
- explanation: explicación de la respuesta

REGLAS ADICIONALES:
- Mínimo 2 pasos evaluables (choice o text) por nodo.
- No pongas theory antes de cada pregunta; intercala teoría solo cuando sea necesario.
- Las preguntas evalúan comprensión, no memorización trivial.
- TODOS los campos son OBLIGATORIOS para cada step.

IMPORTANTE:
- examples debe contener EXACTAMENTE 1 o 2 elementos.
- No uses símbolos aislados como ejemplo.`
}

export function buildUserPrompt(content: string, locale: string, retryError?: string): string {
  const truncated =
    content.length > 30_000 ? `${content.slice(0, 30_000)}\n\n[... texto truncado ...]` : content

  const langInstruction = locale === "en"
    ? "Analyze these notes and generate a complete study map with mixed lessons:"
    : "Analiza estos apuntes y genera un mapa de estudio completo con lecciones mixtas:"

  let prompt = `${langInstruction}\n\n---\n${truncated}\n---`

  if (retryError) {
    const correction = locale === "en"
      ? `CORRECTION REQUIRED: The previous generation failed validation: ${retryError}. Fix the JSON.`
      : `CORRECCIÓN REQUERIDA: La generación anterior falló la validación: ${retryError}. Corrige el JSON.`
    prompt += `\n\n${correction}`
  }

  return prompt
}
