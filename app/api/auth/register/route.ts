import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { validateCSRFTokenFromRequest } from '@/lib/security/csrf'
import { registrationRateLimiter } from '@/lib/security/rate-limit'
import { generateOTP, getCodeExpirationTime } from '@/lib/utils/otp'
import { sendEmail, emailTemplates } from '@/lib/email'


export async function POST(request: NextRequest) {
  try {
    // CSRF protection (skip for development, enable for production)
    if (process.env.NODE_ENV === 'production') {
      const csrfValid = validateCSRFTokenFromRequest(request)
      if (!csrfValid) {
        return errorResponse('Invalid CSRF token', 403)
      }
    }

    // Rate limiting (handled in middleware, but double-check here)
    const rateLimit = registrationRateLimiter.check(request)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          }
        }
      )
    }

    const body = await request.json()
    
    // Validate with better error messages
    let validatedData
    try {
      validatedData = registerSchema.parse(body)
    } catch (validationError: any) {
      console.error('Validation error:', validationError)
      if (validationError.errors) {
        const errorMessages = validationError.errors.map((err: any) => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ')
        return errorResponse(`Validation error: ${errorMessages}`, 400)
      }
      return errorResponse('Invalid input data', 400)
    }

    // Use admin client for registration (needed for auth.admin.createUser)
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    // Check if user already exists in Supabase Auth
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      return errorResponse('Failed to check existing users', 500)
    }

    const existingAuthUser = usersData?.users?.find((u: any) => u.email === validatedData.email)
    if (existingAuthUser) {
      // Check if user has a profile (not orphaned)
      const { data: existingProfile, error: profileCheckError } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('id', existingAuthUser.id)
        .maybeSingle()

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileCheckError)
        // Continue anyway, but log it
      }

      if (existingProfile) {
        // User exists in both Auth and profiles - reject registration
        return errorResponse('An account with this email already exists. Please sign in instead.', 409)
      } else {
        // Orphaned user: exists in Auth but not in profiles
        // Clean up the orphaned Auth user and allow re-registration
        console.warn('Orphaned user found in Auth, cleaning up:', existingAuthUser.id)
        try {
          await adminSupabase.auth.admin.deleteUser(existingAuthUser.id)
          console.log('Orphaned user deleted from Auth, allowing re-registration')
        } catch (deleteError) {
          console.error('Error deleting orphaned user:', deleteError)
          return errorResponse('User with this email already exists. Please contact support if you believe this is an error.', 409)
        }
      }
    }

    // Create user in Supabase Auth
    // In production, email_confirm should be false to require email verification
    // In development, auto-confirm for easier testing
    const emailConfirm = process.env.NODE_ENV === 'production' ? false : true
    
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: emailConfirm, // Require email verification in production
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return errorResponse('An account with this email already exists. Please sign in instead.', 409)
      }
      return errorResponse(authError.message || 'Failed to create user', 400)
    }

    if (!authData.user) {
      return errorResponse('Failed to create user', 500)
    }

    // Determine role (default to TALENT if not provided or invalid)
    const role = validatedData.role === 'TALENT' || validatedData.role === 'CLIENT' 
      ? validatedData.role 
      : 'TALENT'

    // Handle company creation/lookup for CLIENT role
    let companyId: string | null = null
    if (role === 'CLIENT' && validatedData.companyName) {
      // Check if company already exists (case-insensitive)
      const { data: existingCompany } = await adminSupabase
        .from('companies')
        .select('id, name')
        .ilike('name', validatedData.companyName.trim())
        .limit(1)
        .maybeSingle()

      if (existingCompany) {
        companyId = existingCompany.id
        console.log('[API /auth/register] Using existing company:', existingCompany.name)
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await adminSupabase
          .from('companies')
          .insert({
            name: validatedData.companyName.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id, name')
          .single()

        if (companyError) {
          console.warn('[API /auth/register] Could not create company:', companyError.message)
        } else {
          companyId = newCompany.id
          console.log('[API /auth/register] Created new company:', newCompany.name)
        }
      }
    }

    // Set full_name: use companyName for CLIENT, email prefix for TALENT
    const fullName = role === 'CLIENT' && validatedData.companyName 
      ? validatedData.companyName.trim()
      : validatedData.email.split('@')[0]

    // Generate verification code
    const verificationCode = generateOTP()
    const expirationTime = getCodeExpirationTime()

    // Create profile in profiles table with email verification fields
    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: role,
        status: 'ACTIVE',
        email_verified: false, // Email not verified yet
        verification_code: verificationCode,
        verification_code_expires_at: expirationTime.toISOString(),
        verification_attempts: 0,
        last_code_sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      // Rollback: delete auth user if profile creation fails
      try {
        await adminSupabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Error deleting auth user during rollback:', deleteError)
      }
      return errorResponse(`Failed to create profile: ${profileError.message}`, 500)
    }

    // Send verification email
    try {
      const emailTemplate = emailTemplates.emailVerification(
        fullName,
        verificationCode,
        validatedData.email
      )

      await sendEmail({
        to: validatedData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      })

      console.log('[API /auth/register] Verification code sent to:', validatedData.email)
    } catch (emailError) {
      console.error('[API /auth/register] Error sending verification email:', emailError)
      // Don't fail registration - user can request resend later
    }

    // Create role-specific profile
    if (role === 'TALENT') {
      try {
        const { error: talentProfileError } = await adminSupabase
          .from('talent_profiles')
          .insert({
            user_id: authData.user.id,
            status: 'DRAFT',
            is_profile_ready: false,
            profile_completion: 0,
          })
        
        if (talentProfileError) {
          console.warn('Warning: Could not create talent_profile:', talentProfileError.message)
          // Don't fail the whole operation
        }
      } catch (talentError: any) {
        console.warn('Warning: Could not create talent_profile:', talentError?.message || talentError)
        // Don't fail the whole operation
      }
    } else if (role === 'CLIENT') {
      try {
        const { error: recruiterProfileError } = await adminSupabase
          .from('recruiter_profiles')
          .insert({
            user_id: authData.user.id,
            company_id: companyId,
          })
        
        if (recruiterProfileError) {
          console.warn('Warning: Could not create recruiter_profile:', recruiterProfileError.message)
          // Don't fail the whole operation
        } else {
          console.log('[API /auth/register] Created recruiter_profile with company_id:', companyId)
        }
      } catch (recruiterError: any) {
        console.warn('Warning: Could not create recruiter_profile:', recruiterError?.message || recruiterError)
        // Don't fail the whole operation
      }
    }

    // Always require email verification (no auto-login)
    // User must verify email before accessing dashboard
    const jsonResponse = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: role,
          name: profileData?.full_name || null,
          status: profileData?.status || 'ACTIVE',
        },
        emailVerified: false,
        requiresVerification: true,
        message: 'Registration successful! Please check your email for the verification code.',
      },
    }, { status: 201 })

    return jsonResponse
  } catch (error) {
    return handleApiError(error)
  }
}
