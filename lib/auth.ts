import { SignJWT, jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export type UserRole = 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST' | 'CLIENT' | 'TALENT'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

// Edge-compatible password hashing using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const payload = await verifyToken(token)
  if (!payload) {
    console.log('[getUserFromToken] Token verification failed')
    return null
  }

  console.log('[getUserFromToken] Token verified, payload:', { userId: payload.userId, email: payload.email, role: payload.role })

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[getUserFromToken] Supabase not configured')
    return null
  }

  // Use service role key to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get user profile from Supabase
  console.log('[getUserFromToken] Fetching profile for userId:', payload.userId)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, status')
    .eq('id', payload.userId)
    .single()

  if (error) {
    console.error('[getUserFromToken] Profile error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: payload.userId,
    })
    return null
  }

  if (!profile) {
    console.error('[getUserFromToken] Profile not found for userId:', payload.userId)
    return null
  }

  console.log('[getUserFromToken] Profile found:', { id: profile.id, role: profile.role, status: profile.status })

  // Get email from Supabase Auth using admin API
  let email = payload.email
  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(payload.userId)
    if (!authError && authUser?.user?.email) {
      email = authUser.user.email
    }
  } catch (error) {
    console.warn('Could not fetch email from auth:', error)
    // Use email from token payload as fallback
  }
  
  return {
    id: profile.id,
    email: email,
    role: profile.role,
    name: profile.full_name,
    status: profile.status,
  }
}
