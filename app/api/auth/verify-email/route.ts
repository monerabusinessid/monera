import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailSchema } from '@/lib/validations'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { isValidOTPFormat, isCodeExpired } from '@/lib/utils/otp'
import { createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const MAX_VERIFICATION_ATTEMPTS = 3

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    let validatedData
    try {
      validatedData = verifyEmailSchema.parse(body)
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

    const { email, code } = validatedData

    // Use admin client to bypass RLS
    const adminSupabase = await createAdminClient()

    // Find user by email from auth.users
    const { data: authUsers, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      return errorResponse('Failed to verify email', 500)
    }

    const authUser = authUsers?.users?.find((u: any) => u.email === email)
    if (!authUser) {
      return errorResponse('User not found', 404)
    }

    // Get profile from profiles table
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id, email_verified, verification_code, verification_code_expires_at, verification_attempts')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return errorResponse('Profile not found', 404)
    }

    // Check if already verified
    if (profile.email_verified) {
      return errorResponse('Email already verified', 400)
    }

    // Check if code format is valid
    if (!isValidOTPFormat(code)) {
      return errorResponse('Invalid verification code format', 400)
    }

    // Check if code has expired
    if (isCodeExpired(profile.verification_code_expires_at)) {
      return errorResponse('Verification code has expired. Please request a new code.', 400)
    }

    // Check verification attempts
    if (profile.verification_attempts >= MAX_VERIFICATION_ATTEMPTS) {
      return errorResponse('Too many failed attempts. Please request a new verification code.', 429)
    }

    // Verify code
    if (profile.verification_code !== code) {
      // Increment failed attempts
      await adminSupabase
        .from('profiles')
        .update({ 
          verification_attempts: (profile.verification_attempts || 0) + 1 
        })
        .eq('id', authUser.id)

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - (profile.verification_attempts || 0) - 1
      if (remainingAttempts > 0) {
        return errorResponse(`Invalid verification code. ${remainingAttempts} attempt(s) remaining.`, 400)
      } else {
        return errorResponse('Invalid verification code. Too many failed attempts. Please request a new code.', 400)
      }
    }

    // Code is correct - verify email
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
        verification_attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return errorResponse('Failed to verify email', 500)
    }

    // Also update auth user email confirmation status
    try {
      await adminSupabase.auth.admin.updateUserById(authUser.id, {
        email_confirm: true,
      })
    } catch (authUpdateError) {
      console.error('Error updating auth user:', authUpdateError)
      // Continue anyway - profile is updated
    }

    // Get user role for redirect
    const { data: updatedProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    // Generate JWT token for auto-login after verification
    const { generateToken } = await import('@/lib/auth')
    const token = await generateToken({
      userId: authUser.id,
      email: authUser.email!,
      role: (updatedProfile?.role || 'TALENT') as 'TALENT' | 'CLIENT',
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Email verified successfully',
        email_verified: true,
        user: {
          id: authUser.id,
          email: authUser.email,
          role: updatedProfile?.role || 'TALENT',
        },
      },
    })

    // Set auth-token cookie for auto-login
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Error verifying email:', error)
    return errorResponse(error.message || 'Failed to verify email', 500)
  }
}
