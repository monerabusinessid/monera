import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { successResponse, errorResponse } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return errorResponse('Email is required', 400)
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return errorResponse('Supabase not configured', 500)
    }

    // Create response first
    let response = NextResponse.next({ request })
    
    // Create Supabase client with cookie support
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Resend verification email
    // Note: Supabase resend requires the user to be signed in or we need to use admin API
    // For better UX, we'll use admin API to resend verification
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()
    
    // First, get the user by email
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      return errorResponse('Failed to find user', 400)
    }

    const user = usersData?.users?.find((u: any) => u.email === email)
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Check if email is already confirmed
    if (user.email_confirmed_at) {
      return errorResponse('Email is already verified', 400)
    }

    // Resend confirmation email using auth resend endpoint
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      console.error('Error resending verification:', error)
      return errorResponse(error.message || 'Failed to resend verification email', 400)
    }

    return successResponse({
      message: 'If this email is registered and not yet verified, a verification email will be sent.',
    })
  } catch (error) {
    console.error('Error in resend-verification route:', error)
    return errorResponse('Failed to resend verification email', 500)
  }
}
