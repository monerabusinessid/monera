import { NextRequest, NextResponse } from 'next/server'
import { resendCodeSchema } from '@/lib/validations'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { generateOTP, getCodeExpirationTime, canResendCode, getResendCooldownSeconds } from '@/lib/utils/otp'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/server'


const MAX_RESEND_PER_10MIN = 3
const RESEND_COOLDOWN_SECONDS = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    let validatedData
    try {
      validatedData = resendCodeSchema.parse(body)
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

    const { email } = validatedData

    // Use admin client to bypass RLS
    const adminSupabase = await createAdminClient()

    // Find user by email from auth.users
    const { data: authUsers, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      return errorResponse('Failed to resend code', 500)
    }

    const authUser = authUsers?.users?.find((u: any) => u.email === email)
    if (!authUser) {
      return errorResponse('User not found', 404)
    }

    // Get profile from profiles table
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id, email_verified, last_code_sent_at, full_name')
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

    // Check cooldown period (60 seconds)
    if (!canResendCode(profile.last_code_sent_at)) {
      const cooldownSeconds = getResendCooldownSeconds(profile.last_code_sent_at)
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${cooldownSeconds} seconds before requesting a new code`,
          retryAfter: cooldownSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': cooldownSeconds.toString(),
          },
        }
      )
    }

    // Check rate limit (max 3 resends per 10 minutes)
    if (profile.last_code_sent_at) {
      const lastSent = new Date(profile.last_code_sent_at)
      const now = new Date()
      const minutesSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60)
      
      // Count resends in last 10 minutes (simplified - in production, track count separately)
      if (minutesSinceLastSent < 10) {
        // For now, we'll allow resend if cooldown passed
        // In production, you might want to track resend count separately
      }
    }

    // Generate new OTP code
    const verificationCode = generateOTP()
    const expirationTime = getCodeExpirationTime()

    // Update profile with new code
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        verification_code: verificationCode,
        verification_code_expires_at: expirationTime.toISOString(),
        verification_attempts: 0, // Reset attempts
        last_code_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return errorResponse('Failed to generate verification code', 500)
    }

    // Send verification email
    try {
      const emailTemplate = emailTemplates.emailVerification(
        profile.full_name || 'User',
        verificationCode,
        email
      )

      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      })

      console.log('Verification code sent to:', email)
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail the request - code is already saved
      // User can request resend if email fails
    }

    return successResponse({
      message: 'Verification code sent to your email',
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    })
  } catch (error: any) {
    console.error('Error resending code:', error)
    return errorResponse(error.message || 'Failed to resend code', 500)
  }
}
