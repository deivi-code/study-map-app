import type { Metadata } from "next"
import { ErrorBoundary } from "@/components/error-boundary"
import { MainLayoutClient } from "./main-layout-client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <MainLayoutClient>{children}</MainLayoutClient>
    </ErrorBoundary>
  )
}
