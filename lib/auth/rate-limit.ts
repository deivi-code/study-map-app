import { db } from "@/lib/db"
import { rateLimit } from "@/lib/db/schema"

const WINDOW_MS = 3 * 60 * 60 * 1000 // 3 hours

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

// Simple in-memory rate limit fallback for now
// In production, this should use the database properly
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `${userId}:${action}`
  
  const existing = rateLimitStore.get(key)
  const windowStart = now - WINDOW_MS

  if (!existing || existing.windowStart < windowStart) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(now + WINDOW_MS),
    }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.windowStart + WINDOW_MS),
    }
  }

  rateLimitStore.set(key, { count: existing.count + 1, windowStart: existing.windowStart })

  return {
    allowed: true,
    remaining: limit - existing.count - 1,
    resetAt: new Date(existing.windowStart + WINDOW_MS),
  }
}

export async function getAnonymousLimit(): Promise<number> {
  return 3 // 3 maps per 3 hours
}

export async function getAuthenticatedLimit(): Promise<number> {
  return 10 // 10 maps per 3 hours
}
