import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { loginSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { generateToken } from '@/lib/auth'
import { validateCSRFTokenFromRequest } from '@/lib/security/csrf'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse('Supabase not configured', 500)
    }

    const cookiesToSet: Array<{ name: string; value: string; options: any }> = []
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet_) {
          cookiesToSet.push(...cookiesToSet_)
        },
      },
    })

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      // Provide more specific error messages
      if (authError.message.includes('Invalid login credentials')) {
        return errorResponse('Invalid email or password', 401)
      }
      if (authError.message.includes('Email not confirmed') || authError.message.includes('email_not_confirmed')) {
        return errorResponse('Please verify your email before logging in. Check your inbox for the verification link.', 401)
      }
      return errorResponse(authError.message || 'Invalid email or password', 401)
    }

    // Check if email is confirmed (in production)
    if (process.env.NODE_ENV === 'production' && authData.user && !authData.user.email_confirmed_at) {
      return errorResponse('Please verify your email before logging in. Check your inbox for the verification link.', 401)
    }

    if (!authData.user || !authData.session) {
      return errorResponse('Invalid email or password', 401)
    }

    // Get user profile to get role and email verification status
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status, full_name, email_verified')
      .eq('id', authData.user.id)
      .single()

    // If profile doesn't exist, create it automatically
    if (profileError || !profile) {
      console.log('[API /auth/login] Profile not found, creating new profile for user:', authData.user.id)
      
      // Get role from user metadata or default to TALENT
      const userRole = (authData.user.user_metadata?.role as string) || 'TALENT'
      
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
          role: userRole,
          status: 'ACTIVE',
          email_verified: false, // New users need to verify email
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('role, status, full_name, email_verified')
        .single()

      if (createError || !newProfile) {
        console.error('[API /auth/login] Failed to create profile:', createError)
        return errorResponse('Failed to create user profile. Please contact support.', 500)
      }

      profile = newProfile
      console.log('[API /auth/login] Profile created successfully:', profile)
    }

    if (profile.status === 'SUSPENDED') {
      return errorResponse('Account is suspended', 403)
    }

    // Check if email is verified
    if (!profile.email_verified) {
      return NextResponse.json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification code.',
        requiresVerification: true,
        email: authData.user.email,
      }, { status: 403 })
    }

    const token = await generateToken({
      userId: authData.user.id,
      email: authData.user.email!,
      role: profile.role,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: profile.role,
          name: profile.full_name,
          fullName: profile.full_name,
          status: profile.status,
        },
        session: authData.session,
      },
    })

    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    console.log('[API /auth/login] Login successful for user:', authData.user.id)
    return response
  } catch (error) {
    return handleApiError(error)
  }
}
