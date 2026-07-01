"use client"

import { Component, createElement } from "react"
import type { ReactNode } from "react"
import { useTranslations } from 'next-intl'

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('error')
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">{t('message')}</p>
        <button onClick={onRetry} className="mt-2 text-sm text-primary underline underline-offset-4 hover:no-underline">
          {t('retry')}
        </button>
      </div>
    </div>
  )
}

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? createElement(ErrorFallback, { onRetry: () => this.setState({ hasError: false }) })
    }
    return this.props.children
  }
}
