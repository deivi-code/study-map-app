"use client"

import { Suspense, useEffect } from "react"
import { useStudy } from "@/lib/store"
import { SkillTree } from "./skill-tree"
import { NodeDrawer } from "./node-drawer"
import { useSearchParams } from "next/navigation"

function NodeParamHandler() {
  const { openNode, closeNode } = useStudy()
  const searchParams = useSearchParams()
  const node = searchParams.get("node")

  useEffect(() => {
    if (node) openNode(node)
    return () => closeNode()
  }, [node, openNode, closeNode])

  return null
}

export function SkillTreePageWrapper() {
  return (
    <>
      <Suspense fallback={null}>
        <NodeParamHandler />
      </Suspense>
      <SkillTree />
      <NodeDrawer />
    </>
  )
}
