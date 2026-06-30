"use client"

import { Map, ChartBar as BarChart3, Plus } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo, ThemeToggle, AuthButton } from "@/components/brand"

function NavButton({
  active,
  href,
  icon,
  label,
}: {
  active: boolean
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-lg bg-secondary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </span>
    </Link>
  )
}

function AppNav() {
  const pathname = usePathname()
  const match = pathname.match(/\/app\/([^/]+)/)
  const mapId = match?.[1]
  if (!mapId) return null

  const isTree = pathname === `/app/${mapId}`
  const isDashboard = pathname === `/app/${mapId}/dashboard`
  if (!isTree && !isDashboard) return null

  return (
    <nav className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1">
      <NavButton active={isTree} href={`/app/${mapId}`} icon={<Map className="h-4 w-4" />} label="Mapa" />
      <NavButton
        active={isDashboard}
        href={`/app/${mapId}/dashboard`}
        icon={<BarChart3 className="h-4 w-4" />}
        label="Progreso"
      />
    </nav>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" aria-label="Ir al panel principal">
              <Logo />
            </Link>
            <AppNav />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/upload"
              className="hidden items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Plus className="h-4 w-4" />
              Nuevo mapa
            </Link>
            <AuthButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  )
}
