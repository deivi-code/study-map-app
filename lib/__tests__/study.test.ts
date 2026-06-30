import { describe, it, expect } from "vitest"
import { masteryFromScore, computeStats, isUnlocked, getMastery, layoutNodes } from "@/lib/study"
import type { ProgressMap, StudyMap } from "@/lib/types"

const sampleNodes: StudyMap["nodes"] = [
  { id: "a", title: "A", summary: "", detail: "", examples: [], level: 0, deps: [], questions: [] },
  { id: "b", title: "B", summary: "", detail: "", examples: [], level: 1, deps: ["a"], questions: [] },
  { id: "c", title: "C", summary: "", detail: "", examples: [], level: 1, deps: ["a"], questions: [] },
]

describe("masteryFromScore", () => {
  it("returns green for score >= 80", () => {
    expect(masteryFromScore(80)).toBe("green")
    expect(masteryFromScore(100)).toBe("green")
  })
  it("returns amber for score >= 40", () => {
    expect(masteryFromScore(40)).toBe("amber")
    expect(masteryFromScore(79)).toBe("amber")
  })
  it("returns red for score < 40", () => {
    expect(masteryFromScore(0)).toBe("red")
    expect(masteryFromScore(39)).toBe("red")
  })
})

describe("computeStats", () => {
  it("returns zeros for empty progress", () => {
    const map: StudyMap = { id: "m", subject: "t", source: "", createdAt: 0, nodes: sampleNodes }
    const stats = computeStats(map, {})
    expect(stats.green).toBe(0)
    expect(stats.overall).toBe(0)
    // unlocked root node without progress counts as red (weak)
    expect(stats.weak.length).toBeGreaterThanOrEqual(1)
  })

  it("counts green nodes correctly", () => {
    const progress: ProgressMap = { a: { score: 90, mastery: "green", attempts: 1 } }
    const map: StudyMap = { id: "m", subject: "t", source: "", createdAt: 0, nodes: [sampleNodes[0]] }
    const stats = computeStats(map, progress)
    expect(stats.green).toBe(1)
  })

  it("is empty with empty nodes", () => {
    const map: StudyMap = { id: "m", subject: "t", source: "", createdAt: 0, nodes: [] }
    const stats = computeStats(map, {})
    expect(stats.overall).toBe(0)
  })
})

describe("isUnlocked", () => {
  it("returns true for nodes with no deps", () => {
    expect(isUnlocked(sampleNodes[0], {})).toBe(true)
  })
  it("returns false when deps are locked", () => {
    const progress: ProgressMap = {}
    expect(isUnlocked(sampleNodes[1], progress)).toBe(false)
  })
  it("returns true when all deps are at least amber", () => {
    const progress: ProgressMap = { a: { score: 60, mastery: "amber", attempts: 1 } }
    expect(isUnlocked(sampleNodes[1], progress)).toBe(true)
  })
})

describe("getMastery", () => {
  it("returns locked when node has no progress and is locked", () => {
    expect(getMastery("b", sampleNodes[1], {})).toBe("locked")
  })
  it("returns progress mastery when exists", () => {
    const progress: ProgressMap = { a: { score: 90, mastery: "green", attempts: 1 } }
    expect(getMastery("a", sampleNodes[0], progress)).toBe("green")
  })
})

describe("layoutNodes", () => {
  it("returns empty positioned for empty nodes", () => {
    const result = layoutNodes([])
    expect(result.positioned).toHaveLength(0)
  })
  it("positions nodes by level", () => {
    const result = layoutNodes(sampleNodes)
    expect(result.positioned).toHaveLength(3)
    const level0 = result.positioned.filter((n) => n.level === 0)
    const level1 = result.positioned.filter((n) => n.level === 1)
    expect(level0).toHaveLength(1)
    expect(level1).toHaveLength(2)
  })
})
