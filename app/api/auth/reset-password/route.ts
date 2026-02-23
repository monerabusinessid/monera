import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { verifyPassword, hashPassword } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    const supabase = await createAdminClient()

    // Find user with valid reset token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, reset_token_expiry')
      .eq('reset_token', validatedData.token)
      .maybeSingle()

    if (profileError || !profile) {
      console.error('[API /auth/reset-password] Invalid token')
      return errorResponse('Invalid or expired reset link', 400)
    }

    // Check if token is expired
    if (!profile.reset_token_expiry || new Date(profile.reset_token_expiry) < new Date()) {
      console.error('[API /auth/reset-password] Token expired')
      return errorResponse('Reset link has expired. Please request a new one.', 400)
    }

    // Get user email from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id)
    
    if (authError || !authUser.user) {
      console.error('[API /auth/reset-password] User not found in auth')
      return errorResponse('Invalid reset link', 400)
    }

    // Hash new password
    const passwordHash = await await hashPassword(validatedData.password, 10)

    // Update password in auth.users
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.id,
      { password: validatedData.password }
    )

    if (updateError) {
      console.error('[API /auth/reset-password] Error updating password:', updateError)
      return errorResponse('Failed to reset password', 500)
    }

    // Clear reset token
    await supabase
      .from('profiles')
      .update({
        reset_token: null,
        reset_token_expiry: null,
      })
      .eq('id', profile.id)

    console.log('[API /auth/reset-password] Password reset successful for:', authUser.user.email)
    
    return successResponse({
      message: 'Password has been reset successfully. You can now login with your new password.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
