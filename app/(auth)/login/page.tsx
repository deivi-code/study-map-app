"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await authClient.signIn.magicLink({ email, callbackURL: "/" })
      setSent(true)
    } catch {
      setError("Error al enviar el enlace. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await authClient.signIn.social({ provider: "google", callbackURL: "/" })
  }

  if (sent) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-8 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-primary/12">
            <Mail className="size-6 text-primary" />
          </div>
          <h1 className="text-lg font-semibold">Revisa tu correo</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Te hemos enviado un enlace de inicio de sesión a <strong className="text-foreground">{email}</strong>.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Si no lo ves, revisa la bandeja de spam.</p>
          <button
            onClick={() => setSent(false)}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Usar otro correo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card/60 p-8">
          <div className="mb-6 flex justify-center">
            <svg viewBox="0 0 24 24" className="size-10 text-primary" aria-hidden="true">
              <circle cx="12" cy="5" r="2.4" fill="currentColor" />
              <circle cx="5.5" cy="17" r="2.4" fill="currentColor" opacity="0.65" />
              <circle cx="18.5" cy="17" r="2.4" fill="currentColor" opacity="0.65" />
              <path d="M12 7.4 6.6 14.8M12 7.4l5.4 7.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-center text-xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Introduce tu correo para recibir un enlace o usa Google.
          </p>

          <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {error && (
              <p className="text-center text-xs text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Enviar enlace de acceso
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/60 px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}
