import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { loginRateLimiter, apiRateLimiter } from '@/lib/security/rate-limit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply rate limiting (skip in development mode)
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV === 'development') {
      // Allow unlimited login attempts in development
    } else {
      // Production: Apply rate limiting
      const rateLimit = loginRateLimiter.check(request)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Too many login attempts. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': '5',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            }
          }
        )
      }
    }
  }

  // Apply rate limiting to API routes (skip in development mode)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/login')) {
    // Skip rate limiting in development mode
    if (process.env.NODE_ENV === 'development') {
      // Allow unlimited API requests in development
    } else {
      // Production: Apply rate limiting
      const rateLimit = apiRateLimiter.check(request)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Too many requests. Please slow down.',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': '100',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            }
          }
        )
      }
    }
  }

  // Update Supabase session
  let response = await updateSession(request)

  // Add security headers
  const securityHeaders: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  // Add HSTS header for production (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  // Add CSP header
  // In development, allow 'unsafe-eval' for Next.js hot reload and source maps
  // In production, Next.js doesn't use eval, so we can be more strict
  const isDevelopment = process.env.NODE_ENV === 'development'
  const cspHeader = [
    "default-src 'self'",
    isDevelopment 
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com" // Development: allow eval for Next.js HMR
      : "script-src 'self' 'unsafe-inline' https://*.googleapis.com", // Production: no eval needed
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow Google Fonts
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com", // Allow Google Fonts
    "media-src 'self' https://*.supabase.co blob: data:", // Allow video/audio from Supabase Storage
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://oauth2.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  securityHeaders['Content-Security-Policy'] = cspHeader

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
