import { StudyProvider } from "@/lib/store"
import { AppShell } from "@/components/app-shell"

export default function Page() {
  return (
    <StudyProvider>
      <AppShell />
    </StudyProvider>
  )
}
