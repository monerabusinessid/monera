import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const register = searchParams.get('register') === 'true'
    const initialRoleParam = searchParams.get('role') || 'TALENT'

    // Check for OAuth error from Google
    const error = searchParams.get('error')
    if (error) {
      console.error('[Google OAuth] Error from Google:', error)
      const errorDescription = searchParams.get('error_description') || error
      const state = searchParams.get('state') || ''
      const isRegister = state.startsWith('register')
      const errorPath = isRegister ? '/register' : '/login'
      const baseUrl = request.nextUrl.origin
      
      // Map Google OAuth errors to user-friendly messages
      let errorMessage = 'oauth_error'
      if (error === 'access_denied') {
        errorMessage = 'oauth_cancelled'
      } else if (error === 'invalid_request') {
        errorMessage = 'oauth_invalid'
      }
      
      return NextResponse.redirect(`${baseUrl}${errorPath}?error=${errorMessage}&details=${encodeURIComponent(errorDescription)}`)
    }

    if (!code) {
      // Redirect to Google OAuth
      const clientId = process.env.GOOGLE_CLIENT_ID
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google`
      const scope = 'openid email profile'
      const state = register ? `register:${initialRoleParam}` : 'login'

      console.log('[Google OAuth] Initiating OAuth flow:', {
        hasClientId: !!clientId,
        redirectUri,
        register,
        role: initialRoleParam,
        origin: request.nextUrl.origin
      })

      if (!clientId) {
        console.error('[Google OAuth] GOOGLE_CLIENT_ID not configured in environment variables')
        const errorPath = register ? '/register' : '/login'
        return NextResponse.redirect(`${request.nextUrl.origin}${errorPath}?error=oauth_not_configured&details=Google OAuth is not configured. Please check SETUP_GOOGLE_OAUTH.md for setup instructions.`)
      }

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`

      console.log('[Google OAuth] Redirecting to Google OAuth:', {
        register,
        role: initialRoleParam,
        redirectUri,
        hasClientId: !!clientId
      })
      return NextResponse.redirect(authUrl)
    }

    // Exchange code for token
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google`

    console.log('[Google OAuth] Exchanging code for token:', {
      hasCode: !!code,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri
    })

    if (!clientId || !clientSecret) {
      console.error('[Google OAuth] Missing credentials:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      })
      const state = searchParams.get('state') || ''
      const isRegister = state.startsWith('register')
      const errorPath = isRegister ? '/register' : '/login'
      return NextResponse.redirect(`${request.nextUrl.origin}${errorPath}?error=oauth_not_configured&details=Google OAuth credentials are missing. Please check your environment variables.`)
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('[Google OAuth] Token exchange failed:', {
        error: tokenData.error,
        error_description: tokenData.error_description,
        fullResponse: tokenData
      })
      const state = searchParams.get('state') || ''
      const isRegister = state.startsWith('register')
      const errorPath = isRegister ? '/register' : '/login'
      const errorDetails = tokenData.error_description || tokenData.error || 'Token exchange failed'
      return NextResponse.redirect(`${request.nextUrl.origin}${errorPath}?error=oauth_failed&details=${encodeURIComponent(errorDetails)}`)
    }

    console.log('[Google OAuth] Token exchange successful')

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userInfo = await userInfoResponse.json()

    if (!userInfo.email) {
      console.error('[Google OAuth] No email in user info:', userInfo)
      const state = searchParams.get('state') || ''
      const isRegister = state.startsWith('register')
      const errorPath = isRegister ? '/register' : '/login'
      return NextResponse.redirect(`${request.nextUrl.origin}${errorPath}?error=no_email`)
    }

    console.log('[Google OAuth] User info retrieved:', { email: userInfo.email, name: userInfo.name })

    const state = searchParams.get('state') || ''
    const isRegister = state.startsWith('register')
    const userRole = isRegister ? (state.split(':')[1] || 'TALENT') : null

    const adminSupabase = await createAdminClient()

    // Check if user exists in Supabase Auth
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
    if (listError) {
      console.error('Error listing users:', listError)
      throw new Error('Failed to check existing users')
    }

    const existingAuthUser = usersData?.users?.find((u: any) => u.email === userInfo.email)

    let userId: string
    let role: string

    if (existingAuthUser) {
      // User exists in Supabase Auth, check profile
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('id, role')
        .eq('id', existingAuthUser.id)
        .maybeSingle()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError)
        throw new Error('Failed to check user profile')
      }

      if (!profile) {
        if (!isRegister) {
          // User exists in Auth but no profile - redirect to register
          console.log('[Google OAuth] User exists in Auth but no profile, redirecting to register')
          return NextResponse.redirect(
            `${request.nextUrl.origin}/register?error=account_not_found&email=${encodeURIComponent(userInfo.email)}`
          )
        }
        // Create profile for existing auth user
        const profileRole = userRole || 'TALENT'
        console.log('[Google OAuth] Creating profile for existing auth user:', { userId: existingAuthUser.id, role: profileRole })
        
        const { data: newProfileData, error: createProfileError } = await adminSupabase
          .from('profiles')
          .insert({
            id: existingAuthUser.id,
            full_name: userInfo.name || userInfo.email.split('@')[0],
            role: profileRole,
            status: profileRole === 'TALENT' ? 'ACTIVE' : 'ACTIVE', // Both start as ACTIVE in profiles
          })
          .select()
          .single()

        if (createProfileError) {
          console.error('[Google OAuth] Error creating profile for existing user:', {
            code: createProfileError.code,
            message: createProfileError.message,
            details: createProfileError.details,
          })
          throw new Error(`Failed to create user profile: ${createProfileError.message}`)
        }

        if (!newProfileData) {
          console.error('[Google OAuth] Profile created but no data returned for existing user')
          throw new Error('Failed to create user profile: No data returned')
        }

        // Create role-specific profile
        if (profileRole === 'TALENT') {
          const { error: talentProfileError } = await adminSupabase
            .from('talent_profiles')
            .insert({
              user_id: existingAuthUser.id,
              status: 'DRAFT',
              is_profile_ready: false,
              profile_completion: 0,
            })
          
          if (talentProfileError) {
            console.warn('[Google OAuth] Warning: Could not create talent_profile:', talentProfileError.message)
          }
        } else if (profileRole === 'CLIENT') {
          const { error: recruiterProfileError } = await adminSupabase
            .from('recruiter_profiles')
            .insert({
              user_id: existingAuthUser.id,
            })
          
          if (recruiterProfileError) {
            console.warn('[Google OAuth] Warning: Could not create recruiter_profile:', recruiterProfileError.message)
          }
        }

        console.log('[Google OAuth] Profile created for existing user:', { id: newProfileData.id, role: newProfileData.role })
        userId = existingAuthUser.id
        role = profileRole
      } else {
        console.log('[Google OAuth] Using existing profile:', { id: profile.id, role: profile.role })
        userId = profile.id
        role = profile.role
      }
    } else {
      if (!isRegister) {
        // User doesn't exist and trying to login
        return NextResponse.redirect(
          `${request.nextUrl.origin}/register?error=account_not_found&email=${encodeURIComponent(userInfo.email)}`
        )
      }

      // Create new user in Supabase Auth
      const finalRole = userRole || 'TALENT'
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: userInfo.email,
        email_confirm: true, // Auto-confirm for OAuth users
        user_metadata: {
          full_name: userInfo.name || userInfo.email.split('@')[0],
          avatar_url: userInfo.picture,
        },
      })

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError)
        throw new Error('Failed to create user account')
      }

      // Create profile
      const { data: profileData, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: userInfo.name || userInfo.email.split('@')[0],
          role: finalRole,
          status: 'ACTIVE',
        })
        .select()
        .single()

      if (profileError) {
        console.error('[Google OAuth] Error creating profile:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
        })
        // Rollback: delete auth user
        try {
          await adminSupabase.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Error deleting auth user during rollback:', deleteError)
        }
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      if (!profileData) {
        console.error('[Google OAuth] Profile created but no data returned')
        throw new Error('Failed to create user profile: No data returned')
      }

      // Create role-specific profile
      if (finalRole === 'TALENT') {
        const { error: talentProfileError } = await adminSupabase
          .from('talent_profiles')
          .insert({
            user_id: authData.user.id,
            status: 'DRAFT',
            is_profile_ready: false,
            profile_completion: 0,
          })
        
        if (talentProfileError) {
          console.warn('[Google OAuth] Warning: Could not create talent_profile:', talentProfileError.message)
          // Don't fail the whole operation, but log it
        }
      } else if (finalRole === 'CLIENT') {
        const { error: recruiterProfileError } = await adminSupabase
          .from('recruiter_profiles')
          .insert({
            user_id: authData.user.id,
          })
        
        if (recruiterProfileError) {
          console.warn('[Google OAuth] Warning: Could not create recruiter_profile:', recruiterProfileError.message)
          // Don't fail the whole operation, but log it
        }
      }

      console.log('[Google OAuth] Profile created successfully:', { id: profileData.id, role: profileData.role })
      userId = authData.user.id
      role = finalRole
    }

    // Validate required values before generating token
    if (!userId || !userInfo.email || !role) {
      console.error('Missing required values:', { userId, email: userInfo.email, role })
      throw new Error('Missing required user data for token generation')
    }

    // Verify profile exists before generating token (double-check with retry)
    let verifyProfile = null
    let verifyError = null
    let verifyRetries = 0
    const maxVerifyRetries = 3

    while (verifyRetries < maxVerifyRetries && !verifyProfile) {
      const { data: profile, error: error } = await adminSupabase
        .from('profiles')
        .select('id, role, status')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        console.log(`[Google OAuth] Profile verification attempt ${verifyRetries + 1} failed:`, error)
        verifyError = error
        if (verifyRetries < maxVerifyRetries - 1) {
          // Wait a bit before retry (database might need time to commit)
          await new Promise(resolve => setTimeout(resolve, 300))
          verifyRetries++
          continue
        }
      } else {
        verifyProfile = profile
        verifyError = null
        break
      }
    }

    if (verifyError || !verifyProfile) {
      console.error('[Google OAuth] Profile verification failed after all retries:', verifyError)
      throw new Error('Profile verification failed after creation')
    }

    console.log('[Google OAuth] Profile verified after', verifyRetries + 1, 'attempt(s):', { id: verifyProfile.id, role: verifyProfile.role })

    // Generate JWT token
    const token = generateToken({
      userId: userId,
      email: userInfo.email,
      role: role as any,
    })

    if (!token) {
      console.error('[Google OAuth] Failed to generate token')
      throw new Error('Failed to generate authentication token')
    }

    console.log('[Google OAuth] Token generated successfully for user:', { userId, email: userInfo.email, role })

    // Build redirect URL to auth callback page (which will handle token and redirect)
    const baseUrl = request.nextUrl.origin
    // Include register flag in callback URL if this was a registration
    const registerFlag = isRegister ? '&register=true' : ''
    const redirectUrl = `${baseUrl}/auth/callback?token=${encodeURIComponent(token)}&google=true${registerFlag}`

    console.log('[Google OAuth] OAuth success, redirecting to callback:', {
      redirectUrl,
      isRegister,
      role: role
    })
    
    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl)
    
    // Also set the auth-token cookie here for immediate use
    // Set with SameSite=None and Secure in production for cross-site requests
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    console.log('[Google OAuth] Cookie set in response:', {
      hasToken: !!token,
      tokenLength: token.length,
      environment: process.env.NODE_ENV
    })
    
    return response
  } catch (error) {
    console.error('[Google OAuth] Error caught in catch block:', error)
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('[Google OAuth] Error message:', error.message)
      console.error('[Google OAuth] Error stack:', error.stack)
      console.error('[Google OAuth] Error name:', error.name)
    } else {
      console.error('[Google OAuth] Unknown error type:', typeof error, error)
    }
    
    // Determine if it was a registration attempt
    try {
      const searchParams = request.nextUrl.searchParams
      const state = searchParams.get('state') || ''
      const isRegister = state.startsWith('register')
      const errorPath = isRegister ? '/register' : '/login'
      const baseUrl = request.nextUrl.origin
      
      // Get error details for better user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = errorMessage.includes('Profile verification failed') 
        ? 'Profile was created but verification failed. Please try logging in with email/password.'
        : errorMessage.includes('Missing required user data')
        ? 'User data is incomplete. Please try again.'
        : errorMessage.includes('Failed to generate authentication token')
        ? 'Authentication token generation failed. Please try again.'
        : errorMessage
      
      console.error('[Google OAuth] Redirecting to error page:', {
        errorPath,
        errorMessage,
        isRegister,
        baseUrl
      })
      
      return NextResponse.redirect(`${baseUrl}${errorPath}?error=oauth_error&details=${encodeURIComponent(errorDetails)}`)
    } catch (redirectError) {
      // Fallback if redirect fails
      console.error('[Google OAuth] Error creating redirect:', redirectError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'OAuth authentication failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
}
