"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from 'next-intl'

const STORAGE_KEY = "studymap:onboarding"

const stepKeys = ['step1', 'step2', 'step3', 'step4']

export function OnboardingOverlay() {
  const t = useTranslations('onboarding')
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Tutorial de inicio"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label={t('closeAria')}
            >
              <X className="size-4" />
            </button>

            <div className="mb-6 mt-2">
              <div className="flex gap-1.5 mb-4">
                {stepKeys.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i === step ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <h2 className="text-lg font-semibold mb-2">{t(`${stepKeys[step]}Title`)}</h2>
              <p className="text-sm text-muted-foreground">{t(`${stepKeys[step]}Text`)}</p>
            </div>

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {t('skip')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (step < stepKeys.length - 1) setStep(step + 1)
                  else dismiss()
                }}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {step < stepKeys.length - 1 ? t('next') : t('start')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
