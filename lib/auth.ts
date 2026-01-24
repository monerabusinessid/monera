import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  // @ts-ignore - JWT_EXPIRES_IN is a valid string value for expiresIn
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
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
