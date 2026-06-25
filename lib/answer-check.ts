/** Normalizes a short answer for comparison. */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
}

export function checkTextAnswer(input: string, acceptedAnswers: string[]): boolean {
  const normalized = normalizeAnswer(input)
  if (!normalized) return false

  return acceptedAnswers.some((accepted) => {
    const normAccepted = normalizeAnswer(accepted)
    return normalized === normAccepted || normalized.includes(normAccepted)
  })
}

/** Returns true if hint accidentally contains an accepted answer. */
export function hintRevealsAnswer(hint: string, acceptedAnswers: string[]): boolean {
  const normHint = normalizeAnswer(hint)
  return acceptedAnswers.some((a) => {
    const norm = normalizeAnswer(a)
    return norm.length > 3 && normHint.includes(norm)
  })
}
