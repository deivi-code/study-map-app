"use client"

import { useCallback, useEffect, useRef } from "react"
import { useStudy } from "@/lib/store"
import { LessonMode } from "./lesson-mode"
export function LessonPageWrapper({ mapId, nodeId }: { mapId: string; nodeId: string }) {
  const { startLesson, endLesson, closeNode } = useStudy()
  const navigatedRef = useRef(false)

  const handleClose = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    endLesson()
    closeNode()
  }, [endLesson, closeNode])

  useEffect(() => {
    startLesson(nodeId)
  }, [nodeId, startLesson])

  useEffect(() => {
    return () => {
      if (!navigatedRef.current) {
        endLesson()
        closeNode()
      }
    }
  }, [endLesson, closeNode])

  return <LessonMode onClose={handleClose} mapId={mapId} />
}
