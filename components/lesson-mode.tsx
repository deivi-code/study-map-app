"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, BookOpen, Check, Loader2, RotateCcw, Sparkles, X } from "lucide-react"
import { useEffect, useState } from "react"
import { checkTextAnswer } from "@/lib/answer-check"
import { countAssessableSteps, isAssessableStep } from "@/lib/lesson"
import { useStudy } from "@/lib/store"
import { masteryFromScore, masteryMeta } from "@/lib/study"
import type { ChoiceStep, TextStep, TheoryStep } from "@/lib/types"
import { cn } from "@/lib/utils"

export function LessonMode() {
  const { map, lessonNodeId, endLesson } = useStudy()
  const node = map?.nodes.find((n) => n.id === lessonNodeId) ?? null

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-background"
        >
          <LessonRunner key={node.id} nodeId={node.id} onClose={endLesson} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LessonRunner({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const { map, recordLesson, closeNode } = useStudy()
  const node = map!.nodes.find((n) => n.id === nodeId)!
  const steps = node.steps
  const total = steps.length
  const assessableTotal = countAssessableSteps(steps)

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const step = steps[index]
  const score =
    assessableTotal > 0 ? Math.round((correctCount / assessableTotal) * 100) : 100

  function onStepCorrect() {
    setCorrectCount((c) => c + 1)
  }

  function next() {
    if (index + 1 < total) {
      setIndex((i) => i + 1)
    } else {
      setFinished(true)
    }
  }

  useEffect(() => {
    if (finished) recordLesson(nodeId, score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  if (finished) {
    return (
      <Results
        node={node}
        score={score}
        correct={correctCount}
        total={assessableTotal}
        onClose={onClose}
        onRetry={() => {
          setIndex(0)
          setCorrectCount(0)
          setFinished(false)
        }}
        closeNode={closeNode}
      />
    )
  }

  const progressPct = ((index + 1) / total) * 100

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5">
      <header className="flex items-center gap-4 py-6">
        <button
          onClick={onClose}
          aria-label="Salir de la lección"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          Paso {index + 1}/{total}
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${index}-${step.id}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="flex flex-1 flex-col"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{node.title}</p>

          {step.type === "theory" && (
            <TheoryStepView step={step} onContinue={next} />
          )}
          {step.type === "choice" && (
            <ChoiceStepView
              step={step}
              onAnswered={(correct) => {
                if (correct) onStepCorrect()
              }}
              onNext={next}
            />
          )}
          {step.type === "text" && (
            <TextStepView
              step={step}
              context={node.detail}
              onAnswered={(correct) => {
                if (correct) onStepCorrect()
              }}
              onNext={next}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TheoryStepView({ step, onContinue }: { step: TheoryStep; onContinue: () => void }) {
  return (
    <>
      <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
          <BookOpen className="size-4" />
          Teoría
        </div>
        <p className="text-pretty leading-relaxed text-foreground/90">{step.content}</p>
      </div>
      <div className="mt-auto py-6">
        <button
          onClick={onContinue}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01]"
        >
          Continuar
          <ArrowRight className="size-4" />
        </button>
      </div>
    </>
  )
}

function ChoiceStepView({
  step,
  onAnswered,
  onNext,
}: {
  step: ChoiceStep
  onAnswered: (correct: boolean) => void
  onNext: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [shake, setShake] = useState(false)
  const answered = selected !== null
  const isCorrect = selected === step.correctIndex

  function choose(i: number) {
    if (answered) return
    setSelected(i)
    const correct = i === step.correctIndex
    onAnswered(correct)
    if (!correct) {
      setShake(true)
      setTimeout(() => setShake(false), 420)
    }
  }

  return (
    <>
      <motion.div animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
        <h2 className="mt-3 text-balance text-2xl font-semibold leading-snug sm:text-3xl">
          {step.question}
        </h2>
        <div className="mt-8 space-y-3">
          {step.options.map((opt, i) => {
            const state =
              !answered ? "idle" : i === step.correctIndex ? "correct" : i === selected ? "wrong" : "dim"
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => choose(i)}
                whileTap={answered ? {} : { scale: 0.99 }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-colors",
                  state === "idle" && "border-border bg-card/60 hover:border-primary/50",
                  state === "correct" && "border-mastery-green bg-mastery-green/15 text-foreground",
                  state === "wrong" && "border-mastery-red bg-mastery-red/15 text-foreground",
                  state === "dim" && "border-border bg-card/40 opacity-50",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg border text-xs",
                    state === "correct" && "border-mastery-green bg-mastery-green text-background",
                    state === "wrong" && "border-mastery-red bg-mastery-red text-background",
                    (state === "idle" || state === "dim") && "border-border",
                  )}
                >
                  {state === "correct" ? (
                    <Check className="size-4" />
                  ) : state === "wrong" ? (
                    <X className="size-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {opt}
              </motion.button>
            )
          })}
        </div>
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-6 rounded-xl border p-4 text-sm leading-relaxed",
                isCorrect
                  ? "border-mastery-green/40 bg-mastery-green/10"
                  : "border-mastery-red/40 bg-mastery-red/10",
              )}
            >
              <span
                className="font-semibold"
                style={{ color: isCorrect ? "var(--mastery-green)" : "var(--mastery-red)" }}
              >
                {isCorrect ? "¡Correcto! " : "Incorrecto. "}
              </span>
              {step.explanation}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-auto py-6">
        <button
          onClick={onNext}
          disabled={!answered}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ArrowRight className="size-4" />
        </button>
      </div>
    </>
  )
}

function TextStepView({
  step,
  context,
  onAnswered,
  onNext,
}: {
  step: TextStep
  context: string
  onAnswered: (correct: boolean) => void
  onNext: () => void
}) {
  const [input, setInput] = useState("")
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [aiReviewed, setAiReviewed] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  async function checkLocal() {
    if (!input.trim() || answered) return
    const correct = checkTextAnswer(input, step.acceptedAnswers)
    setIsCorrect(correct)
    setAnswered(true)
    onAnswered(correct)
    if (!correct) {
      setFeedback(step.explanation)
      setShake(true)
      setTimeout(() => setShake(false), 420)
    }
  }

  async function requestAiReview() {
    if (aiReviewed || aiLoading || isCorrect) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/validate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: step.question,
          hint: step.hint,
          userAnswer: input,
          acceptedAnswers: step.acceptedAnswers,
          context,
        }),
      })
      const data = (await res.json()) as { correct: boolean; feedback: string }
      setAiReviewed(true)
      setFeedback(data.feedback)
      if (data.correct) {
        setIsCorrect(true)
        onAnswered(true)
      }
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
      <motion.div animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
        <h2 className="mt-3 text-balance text-2xl font-semibold leading-snug sm:text-3xl">
          {step.question}
        </h2>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Pista:</span> {step.hint}
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={answered && isCorrect}
          onKeyDown={(e) => e.key === "Enter" && !answered && checkLocal()}
          placeholder="Escribe tu respuesta…"
          className="mt-6 w-full rounded-xl border border-border bg-card/60 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 disabled:opacity-60"
        />
        {!answered && (
          <button
            onClick={checkLocal}
            disabled={!input.trim()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium transition-colors enabled:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Comprobar
          </button>
        )}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-6 rounded-xl border p-4 text-sm leading-relaxed",
                isCorrect
                  ? "border-mastery-green/40 bg-mastery-green/10"
                  : "border-mastery-red/40 bg-mastery-red/10",
              )}
            >
              <span
                className="font-semibold"
                style={{ color: isCorrect ? "var(--mastery-green)" : "var(--mastery-red)" }}
              >
                {isCorrect ? "¡Correcto! " : "Incorrecto. "}
              </span>
              {feedback ?? step.explanation}
            </motion.div>
          )}
        </AnimatePresence>
        {answered && !isCorrect && !aiReviewed && (
          <button
            onClick={requestAiReview}
            disabled={aiLoading}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Pedir revisión con IA
          </button>
        )}
      </motion.div>
      <div className="mt-auto py-6">
        <button
          onClick={onNext}
          disabled={!answered}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ArrowRight className="size-4" />
        </button>
      </div>
    </>
  )
}

function Results({
  node,
  score,
  correct,
  total,
  onClose,
  onRetry,
  closeNode,
}: {
  node: { title: string }
  score: number
  correct: number
  total: number
  onClose: () => void
  onRetry: () => void
  closeNode: () => void
}) {
  const mastery = masteryFromScore(score)
  const meta = masteryMeta[mastery]
  const circ = 2 * Math.PI * 52

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 text-center"
    >
      <div className="relative grid place-items-center">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r="52" fill="none" stroke="var(--muted)" strokeWidth="10" />
          <motion.circle
            cx="70"
            cy="70"
            r="52"
            fill="none"
            stroke={meta.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (circ * score) / 100 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </svg>
        <div className="absolute flex flex-col">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-semibold tabular-nums"
            style={{ color: meta.color }}
          >
            {score}%
          </motion.span>
          <span className="text-xs text-muted-foreground">
            {correct}/{total} aciertos
          </span>
        </div>
      </div>

      <span
        className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
        style={{ background: `color-mix(in oklch, ${meta.color} 16%, transparent)`, color: meta.color }}
      >
        <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
        {meta.label}
      </span>

      <h2 className="mt-4 text-balance text-2xl font-semibold">{node.title}</h2>
      <p className="mt-2 text-muted-foreground">{meta.coach}</p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <button
          onClick={() => {
            onClose()
            closeNode()
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          Volver al mapa
        </button>
        <button
          onClick={onRetry}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <RotateCcw className="size-4" />
          Repetir lección
        </button>
      </div>
    </motion.div>
  )
}

/** @deprecated Use LessonMode */
export const QuizMode = LessonMode
