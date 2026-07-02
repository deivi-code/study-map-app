import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { generateText } from "ai"
import { generateMapFromContent, extractZodRetryMessage } from "@/lib/generate-map-ai"
import { llmStudyMapSchema, knowledgeNodeSchema } from "@/lib/schemas"

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => vi.fn(() => "mock-model")),
}))

vi.mock("ai", () => ({
  generateText: vi.fn(),
  Output: { object: vi.fn() },
}))

function validNode(id: string, title: string, level: number, deps: string[]) {
  return {
    id,
    title,
    summary: "Summary about " + title + ": core concept",
    detail: "Detail about " + title + " that is long enough to pass the 20 char minimum",
    examples: ["ex1"],
    level,
    deps,
    steps: [
      {
        id: id + "-t1",
        type: "theory" as const,
        content: "Theory about " + title + " that is at least ten chars",
      },
      {
        id: id + "-c1",
        type: "choice" as const,
        question: "What is " + title + "?",
        options: ["A", "B", "C", "D"],
        correctIndex: 0,
        explanation: "Because " + title + " is correct",
      },
      {
        id: id + "-t2",
        type: "text" as const,
        question: "Define " + title,
        hint: "una palabra",
        acceptedAnswers: [title.toLowerCase()],
        explanation: title + " is the answer",
      },
    ],
  }
}

function validMap(subject: string, nodeCount: number) {
  return {
    subject,
    nodes: Array.from({ length: nodeCount }, (_, i) =>
      validNode("n" + i, "Node " + i, i === 0 ? 0 : 1, i === 0 ? [] : ["n0"]),
    ),
  }
}

const LONG_CONTENT =
  "Physics is the natural science that studies matter, its fundamental constituents, " +
  "its motion and behavior through space and time, and the related entities of energy and force."

// ── extractZodRetryMessage ──

describe("extractZodRetryMessage", () => {
  it("returns null for non-object input", () => {
    expect(extractZodRetryMessage(null)).toBeNull()
    expect(extractZodRetryMessage(undefined)).toBeNull()
    expect(extractZodRetryMessage("string")).toBeNull()
    expect(extractZodRetryMessage(42)).toBeNull()
  })

  it("returns null for a plain Error", () => {
    expect(extractZodRetryMessage(new Error("plain"))).toBeNull()
  })

  it("returns null for an object without issues or cause", () => {
    expect(extractZodRetryMessage({})).toBeNull()
  })

  it("extracts from a direct ZodError-like object", () => {
    const err = {
      issues: [{ path: ["nodes"], message: "Too small: expected array to have >=3 items" }],
    }
    expect(extractZodRetryMessage(err)).toBe(
      '"nodes": Too small: expected array to have >=3 items',
    )
  })

  it("traverses cause chain to find ZodError", () => {
    const zodIssues = [{ path: ["nodes"], message: "Too small: expected array to have >=3 items" }]
    const tvError = new Error("Type validation failed")
    tvError.cause = { issues: zodIssues }
    const noObjError = new Error("No object generated")
    noObjError.cause = tvError

    expect(extractZodRetryMessage(noObjError)).toBe(
      '"nodes": Too small: expected array to have >=3 items',
    )
  })

  it("formats multiple issues joined by '. '", () => {
    const err = {
      issues: [
        { path: ["nodes"], message: "Too small: expected array to have >=3 items" },
        { path: ["nodes", 0, "steps"], message: "Too small: expected array to have >=3 items" },
      ],
    }
    const result = extractZodRetryMessage(err)
    expect(result).toContain('"nodes": Too small')
    expect(result).toContain('"nodes.0.steps": Too small')
    expect(result).toContain(". ")
  })

  it("returns null for empty issues array", () => {
    expect(extractZodRetryMessage({ issues: [] })).toBeNull()
  })

  it("handles numeric path segments", () => {
    const err = {
      issues: [
        { path: ["nodes", 0, "title"], message: "String must contain at least 2 character(s)" },
      ],
    }
    expect(extractZodRetryMessage(err)).toBe(
      '"nodes.0.title": String must contain at least 2 character(s)',
    )
  })

  it("handles empty path", () => {
    const err = { issues: [{ path: [], message: "Something went wrong" }] }
    expect(extractZodRetryMessage(err)).toBe("Something went wrong")
  })

  it("handles direct circular cause gracefully", () => {
    const circular: Record<string, unknown> = {
      issues: [{ path: ["x"], message: "circular error" }],
    }
    circular.cause = circular
    expect(extractZodRetryMessage(circular)).toBe('"x": circular error')
  })
})

// ── Schema count constraints ──

describe("llmStudyMapSchema node count", () => {
  it("rejects map with only 2 nodes", async () => {
    const result = await llmStudyMapSchema.safeParseAsync(validMap("Test", 2))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("nodes"))).toBe(true)
    }
  })

  it("accepts map with 3 nodes", async () => {
    const result = await llmStudyMapSchema.safeParseAsync(validMap("Test", 3))
    expect(result.success).toBe(true)
  })

  it("accepts map with 12 nodes", async () => {
    const result = await llmStudyMapSchema.safeParseAsync(validMap("Test", 12))
    expect(result.success).toBe(true)
  })

  it("rejects map with 13 nodes (exceeds max)", async () => {
    const result = await llmStudyMapSchema.safeParseAsync(validMap("Test", 13))
    expect(result.success).toBe(false)
  })
})

describe("knowledgeNodeSchema step count", () => {
  it("rejects node with only 2 steps", async () => {
    const node = validNode("n1", "Node 1", 0, [])
    node.steps = node.steps.slice(0, 2)
    const result = await knowledgeNodeSchema.safeParseAsync(node)
    expect(result.success).toBe(false)
  })

  it("accepts node with 3 steps", async () => {
    const result = await knowledgeNodeSchema.safeParseAsync(validNode("n1", "Node 1", 0, []))
    expect(result.success).toBe(true)
  })

  it("accepts node with 10 steps", async () => {
    const node = validNode("n1", "Node 1", 0, [])
    for (let i = 3; i < 10; i++) {
      node.steps.push({
        id: "a-c" + i,
        type: "choice" as const,
        question: "Question " + i + "?",
        options: ["W", "X", "Y", "Z"],
        correctIndex: 0,
        explanation: "Because it is the correct answer",
      })
    }
    const result = await knowledgeNodeSchema.safeParseAsync(node)
    expect(result.success).toBe(true)
  })
})

// ── generateMapFromContent ──

describe("generateMapFromContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key"
  })

  afterEach(() => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
  })

  it("falls back to templates when no API key is set", async () => {
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const result = await generateMapFromContent(LONG_CONTENT, "test")
    expect(result.usedAi).toBe(false)
    expect(result.map.subject).toBeTruthy()
  })

  it("returns AI-generated map on successful LLM call", async () => {
    const map = validMap("Physics", 3)
    vi.mocked(generateText).mockResolvedValueOnce({ output: map } as any)

    const result = await generateMapFromContent(LONG_CONTENT, "test")
    expect(result.usedAi).toBe(true)
    expect(result.map.subject).toBe("Physics")
    expect(result.map.nodes).toHaveLength(3)
  })

  it("retries on Zod validation error and uses AI result on second attempt", async () => {
    const map = validMap("Physics", 3)

    const tvError = new Error("Type validation failed")
    tvError.cause = { issues: [{ path: ["nodes"], message: "Too small" }] }
    const firstError = new Error("No object generated")
    firstError.cause = tvError

    vi.mocked(generateText)
      .mockRejectedValueOnce(firstError)
      .mockResolvedValueOnce({ output: map } as any)

    const result = await generateMapFromContent(LONG_CONTENT, "test")
    expect(result.usedAi).toBe(true)
    expect(result.map.subject).toBe("Physics")
    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it("falls back to templates when both LLM attempt and Zod retry fail", async () => {
    const tvError1 = new Error("Type validation failed")
    tvError1.cause = { issues: [{ path: ["nodes"], message: "Too small" }] }
    const firstError = new Error("No object generated")
    firstError.cause = tvError1

    const tvError2 = new Error("Type validation failed")
    tvError2.cause = { issues: [{ path: ["nodes"], message: "Still too small" }] }
    const secondError = new Error("No object generated")
    secondError.cause = tvError2

    vi.mocked(generateText)
      .mockRejectedValueOnce(firstError)
      .mockRejectedValueOnce(secondError)

    const result = await generateMapFromContent(LONG_CONTENT, "test")
    expect(result.usedAi).toBe(false)
    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it("falls back to templates on non-Zod errors (e.g. API failure)", async () => {
    vi.mocked(generateText).mockRejectedValueOnce(new Error("API rate limited"))

    const result = await generateMapFromContent(LONG_CONTENT, "test")
    expect(result.usedAi).toBe(false)
  })

  it("throws on content shorter than MIN_CONTENT_LENGTH (50)", async () => {
    await expect(
      generateMapFromContent("too short", "test"),
    ).rejects.toThrow("demasiado corto")
  })
})
