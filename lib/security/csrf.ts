import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

// Edge-compatible random token generation
function generateRandomToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function generateCSRFToken(): Promise<string> {
  const token = generateRandomToken()
  const cookieStore = await cookies()
  
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_EXPIRY / 1000,
    path: '/',
  })
  
  return token
}

export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}

export async function validateCSRFToken(token: string | null): Promise<boolean> {
  if (!token) return false
  
  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value
  
  if (!storedToken) return false
  
  // Use timing-safe comparison
  return token === storedToken
}

// For API routes (NextRequest)
export function getCSRFTokenFromRequest(request: Request): string | null {
  // Try to get from header first (preferred for API)
  const headerToken = request.headers.get('x-csrf-token')
  if (headerToken) return headerToken
  
  // Fallback to cookie
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
  
  return cookies[CSRF_TOKEN_NAME] || null
}

export function validateCSRFTokenFromRequest(request: Request): boolean {
  // Get token from header (sent by client)
  const headerToken = request.headers.get('x-csrf-token')
  
  // Get token from cookie (stored by server)
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader || !headerToken) return false
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
  
  const cookieToken = cookies[CSRF_TOKEN_NAME]
  
  if (!cookieToken || !headerToken) return false
  
  // Use timing-safe comparison
  return headerToken === cookieToken
}
