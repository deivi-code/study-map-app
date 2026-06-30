"use client"

import { useStudy } from "@/lib/store"
import { Dashboard } from "./dashboard"
import { NodeDrawer } from "./node-drawer"

export function DashboardPageWrapper() {
  return (
    <>
      <Dashboard />
      <NodeDrawer />
    </>
  )
}
