"use client"

import { useCallback, useEffect, useRef } from "react"
import { useStudy } from "@/lib/store"
import { LessonMode } from "./lesson-mode"
import { useRouter } from "next/navigation"

export function LessonPageWrapper({ mapId, nodeId }: { mapId: string; nodeId: string }) {
  const { startLesson, endLesson, closeNode } = useStudy()
  const router = useRouter()
  const navigatedRef = useRef(false)

  const handleClose = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    endLesson()
    closeNode()
    router.push(`/app/${mapId}`)
  }, [endLesson, closeNode, router, mapId])

  useEffect(() => {
    startLesson(nodeId)
  }, [nodeId, startLesson])

  useEffect(() => {
    const onPopState = () => {
      if (!navigatedRef.current) {
        navigatedRef.current = true
        endLesson()
        closeNode()
      }
    }
    window.addEventListener("popstate", onPopState)
    return () => {
      window.removeEventListener("popstate", onPopState)
      if (!navigatedRef.current) {
        navigatedRef.current = true
        endLesson()
        closeNode()
      }
    }
  }, [endLesson, closeNode])

  return <LessonMode onClose={handleClose} />
}
