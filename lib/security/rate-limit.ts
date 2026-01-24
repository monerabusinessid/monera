// Simple in-memory rate limiter
// For production, consider using Redis or Upstash

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: Request) => string // Custom key generator
}

export class RateLimiter {
  private windowMs: number
  private maxRequests: number
  private keyGenerator: (request: Request) => string

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs
    this.maxRequests = options.maxRequests
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator
  }

  private defaultKeyGenerator(request: Request): string {
    // Use IP address as default key
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown'
    return ip
  }

  private getKey(request: Request): string {
    return this.keyGenerator(request)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    }
  }

  check(request: Request): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup()
    
    const key = this.getKey(request)
    const now = Date.now()
    
    if (!store[key] || store[key].resetTime < now) {
      // Create new window
      store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: store[key].resetTime,
      }
    }

    if (store[key].count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: store[key].resetTime,
      }
    }

    store[key].count++
    return {
      allowed: true,
      remaining: this.maxRequests - store[key].count,
      resetTime: store[key].resetTime,
    }
  }
}

// Pre-configured rate limiters
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (request) => {
    // Use IP + email for login attempts
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown'
    // Try to get email from body (for login endpoint)
    return `login:${ip}`
  },
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

export const registrationRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour
})
