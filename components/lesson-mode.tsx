"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, BookOpen, Check, Loader2, RotateCcw, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { checkTextAnswer } from "@/lib/answer-check"
import { countAssessableSteps, isAssessableStep } from "@/lib/lesson"
import { useStudy } from "@/lib/store"
import { recordLessonAction } from "@/lib/actions/record-lesson"
import { validateAnswerAction } from "@/lib/actions/validate-answer"
import { masteryFromScore, masteryMeta } from "@/lib/study"
import type { ChoiceStep, TextStep, TheoryStep } from "@/lib/types"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function LessonMode({ onClose: externalClose, mapId }: { onClose?: () => void; mapId?: string }) {
  const { map, lessonNodeId, endLesson } = useStudy()
  const node = map?.nodes.find((n) => n.id === lessonNodeId) ?? null
  const handleClose = externalClose ?? endLesson

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-background"
        >
          <LessonRunner key={node.id} nodeId={node.id} onClose={handleClose} mapId={mapId ?? map?.id} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ConfirmDialog({ onConfirm, onCancel, mapId }: { onConfirm: () => void; onCancel: () => void; mapId?: string }) {
  const t = useTranslations("lesson")
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold">{t('exitTitle')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('exitDesc')}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            {t('continue')}
          </button>
          <Link
            href={`/app/${mapId}`}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:opacity-90"
          >
            {t('exit')}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LessonRunner({ nodeId, onClose, mapId }: { nodeId: string; onClose: () => void; mapId?: string }) {
  const t = useTranslations("lesson")
  const { map, recordLesson, closeNode } = useStudy()
  const node = map!.nodes.find((n) => n.id === nodeId)!
  const steps = node.steps
  const total = steps.length
  const assessableTotal = countAssessableSteps(steps)

  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const persistedRef = useRef(false)

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

  function handleExit() {
    if (!finished && !showExitConfirm) {
      setShowExitConfirm(true)
    } else {
      onClose()
    }
  }

  function handleRetry() {
    setIndex(0)
    setCorrectCount(0)
    setFinished(false)
    persistedRef.current = false
  }

  useEffect(() => {
    if (finished && !persistedRef.current) {
      persistedRef.current = true
      recordLesson(nodeId, score)
      recordLessonAction(map!.id, nodeId, score)
    }
  }, [finished, nodeId, score, map, recordLesson])

  if (finished) {
    return (
      <>
        <Results
          node={node}
          score={score}
          correct={correctCount}
          total={assessableTotal}
          onClose={onClose}
          onRetry={handleRetry}
          closeNode={closeNode}
          mapId={mapId}
        />
      </>
    )
  }

  const progressPct = ((index + 1) / total) * 100

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5">
        <header className="flex items-center gap-4 py-6">
          <button
            onClick={handleExit}
            aria-label={t('exitAria')}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-5" />
          </button>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('progressAria')}
          >
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">
            {t('step')} {index + 1}/{total}
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
      {showExitConfirm && (
        <ConfirmDialog
          onConfirm={onClose}
          onCancel={() => setShowExitConfirm(false)}
          mapId={mapId}
        />
      )}
    </>
  )
}

function TheoryStepView({ step, onContinue }: { step: TheoryStep; onContinue: () => void }) {
  const t = useTranslations("lesson")
  return (
    <>
      <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
          <BookOpen className="size-4" />
          {t('theory')}
        </div>
        <p className="text-pretty leading-relaxed text-foreground/90">{step.content}</p>
      </div>
      <div className="mt-auto py-6">
        <button
          onClick={onContinue}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.01]"
        >
          {t('continue')}
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
  const t = useTranslations("lesson")
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
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20)
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
                aria-pressed={selected === i}
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
                {isCorrect ? `${t('correct')} ` : `${t('incorrect')} `}
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
          {t('next')}
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
  const t = useTranslations("lesson")
  const [input, setInput] = useState("")
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
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
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20)
    }
  }

  async function requestAiReview() {
    if (aiLoading || isCorrect) return
    setAiLoading(true)
    try {
      const data = await validateAnswerAction({
        question: step.question,
        hint: step.hint,
        userAnswer: input,
        acceptedAnswers: step.acceptedAnswers,
        context,
      })
      setAiFeedback(data.feedback)
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
          <span className="font-medium text-foreground/80">{t('hint')}</span> {step.hint}
        </p>
        <label htmlFor="lesson-text-answer" className="sr-only">{t('answerLabel')}</label>
        <input
          id="lesson-text-answer"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={answered && isCorrect}
          onKeyDown={(e) => e.key === "Enter" && !answered && checkLocal()}
          placeholder={t('answerPlaceholder')}
          className="mt-6 w-full rounded-xl border border-border bg-card/60 px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 disabled:opacity-60"
        />
        {!answered && (
          <button
            onClick={checkLocal}
            disabled={!input.trim()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium transition-colors enabled:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('check')}
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
                {isCorrect ? `${t('correct')} ` : `${t('incorrect')} `}
              </span>
              {(aiFeedback ?? feedback) || step.explanation}
            </motion.div>
          )}
        </AnimatePresence>
        {answered && !isCorrect && !aiFeedback && !aiLoading && (
          <button
            onClick={requestAiReview}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {t('aiReview')}
          </button>
        )}
        {answered && !isCorrect && aiFeedback && !aiLoading && (
          <button
            onClick={() => { setAnswered(false); setAiFeedback(null); setFeedback(null) }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            {t('retryAnswer')}
          </button>
        )}
      </motion.div>
      <div className="mt-auto py-6">
        <button
          onClick={onNext}
          disabled={!answered}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('next')}
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
  mapId,
}: {
  node: { title: string }
  score: number
  correct: number
  total: number
  onClose: () => void
  onRetry: () => void
  closeNode: () => void
  mapId?: string
}) {
  const t = useTranslations("lesson")
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
            {total > 0 ? `${correct}/${total} ${t('resultsCorrect')}` : t('resultsNoQuestions')}
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
        <Link
          href={`/app/${mapId}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          {t('backToMap')}
        </Link>
        <button
          onClick={onRetry}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <RotateCcw className="size-4" />
          {t('repeatLesson')}
        </button>
      </div>
    </motion.div>
  )
}

/** @deprecated Use LessonMode */
