import { NextRequest } from 'next/server'

// Simple in-memory rate limiting
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { success: boolean; resetTime?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(identifier)
  }

  const currentEntry = rateLimitMap.get(identifier)

  if (!currentEntry) {
    // First request
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return { success: true }
  }

  if (currentEntry.count >= config.maxRequests) {
    // Rate limited
    return {
      success: false,
      resetTime: currentEntry.resetTime,
    }
  }

  // Increment count
  currentEntry.count++
  return { success: true }
}

export function getRateLimitIdentifier(request: NextRequest): string {
  // Use IP address + user ID (if available) for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Create a simple hash (in production, use a proper hashing function)
  return `${ip}-${userAgent}`.replace(/[^a-zA-Z0-9-]/g, '')
}

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}
