import type { KnowledgeNode, LessonStep, QuizQuestion } from "./types"

/** Converts legacy multiple-choice questions into choice steps. */
export function questionsToSteps(questions: QuizQuestion[]): LessonStep[] {
  return questions.map((q) => ({
    type: "choice" as const,
    id: q.id,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }))
}

/** Enriched lesson steps for biology pilot nodes. */
const biologyEnrichments: Record<string, (steps: LessonStep[]) => LessonStep[]> = {
  celula: (steps) => [
    {
      type: "theory",
      id: "celula-intro",
      content:
        "La célula es la unidad mínima con vida propia. Todo organismo está formado por una o más células.",
    },
    steps[0],
    steps[1],
    {
      type: "text",
      id: "celula-q3-text",
      question: "Nombra las tres funciones vitales que realiza toda célula.",
      hint: "Tres palabras separadas por comas",
      acceptedAnswers: [
        "nutrición, relación, reproducción",
        "nutricion, relacion, reproduccion",
        "nutrición relación reproducción",
      ],
      explanation: "Toda célula cumple nutrición, relación y reproducción.",
    },
  ],
  membrana: (steps) => [
    {
      type: "theory",
      id: "membrana-intro",
      content:
        "La membrana plasmática es una bicapa lipídica que regula qué entra y sale de la célula.",
    },
    steps[0],
    {
      type: "text",
      id: "membrana-q2-text",
      question: "¿Cómo se llama la propiedad de la membrana que controla el paso de sustancias?",
      hint: "Una palabra: termina en -iva",
      acceptedAnswers: ["selectiva", "permeabilidad selectiva", "permeabilidad"],
      explanation: "La membrana tiene permeabilidad selectiva.",
    },
    steps[2],
  ],
  nucleo: (steps) => [
    {
      type: "theory",
      id: "nucleo-intro",
      content: "El núcleo almacena el ADN y dirige la actividad celular.",
    },
    ...steps,
  ],
  adn: (steps) => [
    steps[0],
    {
      type: "text",
      id: "adn-q2-text",
      question: "¿Qué forma tiene la molécula de ADN?",
      hint: "Dos palabras en español",
      acceptedAnswers: ["doble hélice", "doble helice", "hélice doble", "helice doble"],
      explanation: "El ADN tiene estructura de doble hélice.",
    },
    steps[2],
  ],
}

export function enrichBiologySteps(nodeId: string, steps: LessonStep[]): LessonStep[] {
  const enrich = biologyEnrichments[nodeId]
  return enrich ? enrich(steps) : steps
}

export type LegacyKnowledgeNode = Omit<KnowledgeNode, "steps"> & { questions: QuizQuestion[] }

export function legacyNodeToKnowledgeNode(
  raw: LegacyKnowledgeNode,
  templateKey?: string,
): KnowledgeNode {
  let steps = questionsToSteps(raw.questions)
  if (templateKey === "biologia") {
    steps = enrichBiologySteps(raw.id, steps)
  }
  const { questions: _q, ...rest } = raw
  return { ...rest, steps }
}

export function legacyNodesToKnowledgeNodes(
  nodes: LegacyKnowledgeNode[],
  templateKey?: string,
): KnowledgeNode[] {
  return nodes.map((n) => legacyNodeToKnowledgeNode(n, templateKey))
}
