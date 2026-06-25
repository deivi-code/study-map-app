export type Mastery = "locked" | "red" | "amber" | "green"

/** @deprecated Legacy format — use LessonStep */
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TheoryStep {
  type: "theory"
  id: string
  content: string
}

export interface ChoiceStep {
  type: "choice"
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface TextStep {
  type: "text"
  id: string
  question: string
  hint: string
  acceptedAnswers: string[]
  explanation: string
}

export type LessonStep = TheoryStep | ChoiceStep | TextStep

export interface KnowledgeNode {
  id: string
  title: string
  summary: string
  detail: string
  examples: string[]
  /** depth in the tree, used for vertical layout */
  level: number
  /** ids of prerequisite nodes */
  deps: string[]
  steps: LessonStep[]
}

export interface StudyMap {
  id: string
  subject: string
  source: string
  createdAt: number
  nodes: KnowledgeNode[]
}

export interface NodeProgress {
  /** 0 - 100 */
  score: number
  mastery: Mastery
  attempts: number
}

export type ProgressMap = Record<string, NodeProgress>
