import type { Metadata } from "next"
import { MainLayoutClient } from "./main-layout-client"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <MainLayoutClient>{children}</MainLayoutClient>
}
