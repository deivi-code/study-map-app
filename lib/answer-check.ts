/** Normalizes a short answer for comparison. */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
}

function tokenize(value: string): string[] {
  return normalizeAnswer(value)
    .split(/\s+/)
    .filter(Boolean)
}

export function checkTextAnswer(input: string, acceptedAnswers: string[]): boolean {
  const normalized = normalizeAnswer(input)
  if (!normalized) return false

  return acceptedAnswers.some((accepted) => {
    const normAccepted = normalizeAnswer(accepted)
    if (normalized === normAccepted) return true
    const inputTokens = tokenize(input)
    const acceptedTokens = tokenize(accepted)
    return acceptedTokens.length > 0 && acceptedTokens.every((t) => inputTokens.includes(t))
  })
}

/** Returns true if hint accidentally contains an accepted answer. */
export function hintRevealsAnswer(hint: string, acceptedAnswers: string[]): boolean {
  const normHint = normalizeAnswer(hint)
  return acceptedAnswers.some((a) => {
    const norm = normalizeAnswer(a)
    return norm.length > 3 && tokenize(normHint).includes(norm)
  })
}
