"use client"

import { Component } from "react"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Algo salió mal.</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-2 text-sm text-primary underline underline-offset-4 hover:no-underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
