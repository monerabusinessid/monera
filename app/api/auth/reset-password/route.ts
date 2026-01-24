import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { z } from 'zod'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

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

    // Check if user is authenticated (should have session from password reset link)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[API /auth/reset-password] User not authenticated:', userError)
      return errorResponse('Invalid or expired reset link. Please request a new password reset.', 401)
    }

    // Update password using the authenticated session
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    })

    if (error) {
      console.error('[API /auth/reset-password] Error updating password:', error)
      return errorResponse(error.message || 'Failed to reset password. The link may have expired.', 400)
    }

    console.log('[API /auth/reset-password] Password reset successful for user:', user.id)
    
    // Return success response with cookies
    const jsonResponse = successResponse({
      message: 'Password has been reset successfully. You can now login with your new password.',
    })

    // Copy cookies from supabaseResponse to jsonResponse
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, cookie)
    })

    return jsonResponse
  } catch (error) {
    return handleApiError(error)
  }
}
