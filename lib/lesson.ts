import type { ChoiceStep, LessonStep, TextStep } from "./types"

export function isAssessableStep(step: LessonStep): step is ChoiceStep | TextStep {
  return step.type === "choice" || step.type === "text"
}

export function countAssessableSteps(steps: LessonStep[]): number {
  return steps.filter(isAssessableStep).length
}

export function lessonStepSummary(steps: LessonStep[]): {
  total: number
  theory: number
  assessable: number
} {
  const theory = steps.filter((s) => s.type === "theory").length
  const assessable = countAssessableSteps(steps)
  return { total: steps.length, theory, assessable }
}
