import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { loginSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { generateToken } from '@/lib/auth'
import { validateCSRFTokenFromRequest } from '@/lib/security/csrf'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // CSRF protection (skip for development, enable for production)
    if (process.env.NODE_ENV === 'production') {
      const csrfValid = validateCSRFTokenFromRequest(request)
      if (!csrfValid) {
        return errorResponse('Invalid CSRF token', 403)
      }
    }

    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse('Supabase not configured', 500)
    }

    // Create response first - we'll use this to collect Supabase cookies
    let supabaseResponse = NextResponse.next({ request })
    
    // Create Supabase client with cookie support
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update response with new cookies from Supabase
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
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

    // Generate JWT token for backward compatibility (but store in httpOnly cookie)
    const token = generateToken({
      userId: authData.user.id,
      email: authData.user.email!,
      role: profile.role,
    })

    // Create JSON response - copy all cookies from Supabase response
    const jsonResponse = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: profile.role,
          name: profile.full_name,
          fullName: profile.full_name,
          status: profile.status, // Include status for redirect logic
        },
        // Don't return token in response body for security
        // Token is stored in httpOnly cookie
        session: authData.session,
      },
    })

    // Copy all cookies from Supabase response (these are the session cookies)
    // Supabase SSR automatically sets session cookies via setAll callback
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly ?? true,
        secure: cookie.secure ?? (process.env.NODE_ENV === 'production'),
        sameSite: (cookie.sameSite as 'lax' | 'strict' | 'none') ?? 'lax',
        path: cookie.path ?? '/',
        maxAge: cookie.maxAge,
      })
    })

    // Store JWT token in httpOnly cookie for additional security (backward compatibility)
    jsonResponse.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Use 'lax' for both dev and prod
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days (match JWT_EXPIRES_IN)
      // Explicitly set domain to undefined for localhost (default behavior)
      // This ensures cookie works on localhost
    })

    console.log('[API /auth/login] Login successful, cookies set for user:', authData.user.id)
    return jsonResponse
  } catch (error) {
    return handleApiError(error)
  }
}
