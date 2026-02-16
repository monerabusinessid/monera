import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import crypto from 'crypto'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const supabase = await createAdminClient()

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('[API /auth/forgot-password] Error fetching users:', authError)
      return errorResponse('Failed to process request', 500)
    }

    const user = authUsers.users.find(u => u.email === validatedData.email)
    
    console.log('[API /auth/forgot-password] User lookup result:', user ? 'Found' : 'Not found')

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      console.log('[API /auth/forgot-password] Email not found:', validatedData.email)
      return successResponse({
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Try to find existing profile or create one
    let profile = null
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    
    if (existingProfile) {
      // Update existing profile with reset token
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('[API /auth/forgot-password] Error updating profile:', updateError)
        return errorResponse('Failed to process request', 500)
      }
      profile = existingProfile
    } else {
      // Create new profile with reset token
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          first_name: user.user_metadata?.full_name?.split(' ')[0] || user.email.split('@')[0],
          last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          role: 'CANDIDATE',
          status: 'ACTIVE',
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry.toISOString(),
        })
        .select()
        .single()
      
      if (createError) {
        console.error('[API /auth/forgot-password] Error creating profile:', createError)
        return errorResponse('Failed to process request', 500)
      }
      profile = newProfile
    }

    // Send email with reset link
    const resetUrl = `${request.nextUrl.origin}/reset-password?token=${resetToken}`
    
    try {
      const { sendEmail, emailTemplates } = await import('@/lib/email')
      
      // Get user name from user metadata or profile
      const userName = user.user_metadata?.full_name || 
                      profile?.first_name || 
                      profile?.full_name || 
                      user.email.split('@')[0] || 
                      'User'
      
      console.log('[API /auth/forgot-password] Using name for email:', userName)
      
      const emailContent = emailTemplates.passwordReset(userName, resetToken)
      
      console.log('[API /auth/forgot-password] Sending email to:', validatedData.email)
      console.log('[API /auth/forgot-password] Reset URL:', resetUrl)
      
      await sendEmail({
        to: validatedData.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
      
      console.log('[API /auth/forgot-password] Reset email sent successfully to:', validatedData.email)
    } catch (emailError) {
      console.error('[API /auth/forgot-password] Error sending email:', emailError)
      console.error('[API /auth/forgot-password] Email error details:', {
        message: emailError.message,
        code: emailError.code,
        response: emailError.response
      })
      // Don't fail the request if email fails - user can still use the link from logs
    }

    return successResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
