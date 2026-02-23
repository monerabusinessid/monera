import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { generateOTP, getCodeExpirationTime } from '@/lib/utils/otp'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    const { email, password, role } = validatedData

    const adminSupabase = await createAdminClient()

    // Check if user already exists in Supabase Auth
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      return errorResponse('Failed to check existing users', 500)
    }

    const existingUser = usersData?.users?.find((u: any) => u.email === email)
    if (existingUser) {
      return errorResponse('Email already exists. Please sign in instead.', 409)
    }

    // Always require email verification after registration
    const emailVerified = false

    const fullName = email.split('@')[0] || 'User'

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: emailVerified,
      user_metadata: {
        full_name: fullName,
        role,
      },
    })

    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError)
      return errorResponse(authError?.message || 'Failed to create user account', 400)
    }

    // Generate verification code
    const verificationCode = generateOTP()
    const verificationCodeExpiresAt = getCodeExpirationTime()

    // Create profile
    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role,
        status: 'ACTIVE',
        email_verified: emailVerified,
        verification_code: verificationCode,
        verification_code_expires_at: verificationCodeExpiresAt.toISOString(),
        verification_attempts: 0,
        last_code_sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError || !profileData) {
      console.error('Error creating profile:', profileError)
      // Rollback auth user if profile creation fails
      try {
        await adminSupabase.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Error deleting auth user during rollback:', deleteError)
      }
      return errorResponse('Failed to create user profile', 500)
    }

    // Create role-specific profile
    if (role === 'TALENT') {
      const { error: talentProfileError } = await adminSupabase
        .from('talent_profiles')
        .insert({
          user_id: authData.user.id,
          status: 'DRAFT',
          is_profile_ready: false,
          profile_completion: 0,
        })

      if (talentProfileError) {
        console.warn('Warning: could not create talent_profile:', talentProfileError.message)
      }
    } else if (role === 'CLIENT') {
      const { error: recruiterProfileError } = await adminSupabase
        .from('recruiter_profiles')
        .insert({
          user_id: authData.user.id,
        })

      if (recruiterProfileError) {
        console.warn('Warning: could not create recruiter_profile:', recruiterProfileError.message)
      }
    }

    // Send verification email
    if (verificationCode) {
      try {
        const emailTemplate = emailTemplates.emailVerification(fullName, verificationCode, email)
        await sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
        // Don't fail registration if email fails
      }
    }

    const responseData: Record<string, any> = {
      user: {
        id: authData.user.id,
        email,
        role,
        name: fullName,
        status: profileData.status || 'ACTIVE',
      },
      requiresVerification: true,
      emailVerified: false,
      message: 'Verification code sent to your email',
    }
    if (process.env.NODE_ENV !== 'production') {
      responseData.devVerificationCode = verificationCode
      console.log('[Auth/Register] Dev verification code:', verificationCode)
    }

    return successResponse(responseData, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
