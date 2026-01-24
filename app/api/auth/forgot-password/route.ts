import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { forgotPasswordSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse('Supabase not configured', 500)
    }

    // Create Supabase client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Not needed for password reset request
        },
      },
    })

    // Request password reset
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${request.nextUrl.origin}/reset-password`,
    })

    if (error) {
      console.error('[API /auth/forgot-password] Error:', error)
      // Don't reveal if email exists or not for security
      // Always return success message
      return successResponse({
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    console.log('[API /auth/forgot-password] Password reset email sent to:', validatedData.email)
    
    // Always return success message (security best practice - don't reveal if email exists)
    return successResponse({
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
