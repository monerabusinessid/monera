'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import Link from 'next/link'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'TALENT' | 'CLIENT'>('TALENT')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleInitialized = useRef(false) // Track if role has been set from URL or user selection

  useEffect(() => {
    // Set page title
    document.title = 'Sign up for Monera | Client & Talent Account'

    // Only set role from URL param on initial load (once)
    if (!roleInitialized.current) {
      const roleParam = searchParams.get('role')
      if (roleParam === 'TALENT' || roleParam === 'CLIENT') {
        console.log('[Register] Setting role from URL param:', roleParam)
        setRole(roleParam as 'TALENT' | 'CLIENT')
        roleInitialized.current = true
      } else if (roleParam === 'CANDIDATE') {
        // Backward compatibility: map CANDIDATE to TALENT
        console.log('[Register] Setting role from URL param (CANDIDATE -> TALENT)')
        setRole('TALENT')
        roleInitialized.current = true
      } else if (roleParam === 'RECRUITER') {
        // Backward compatibility: map RECRUITER to CLIENT
        console.log('[Register] Setting role from URL param (RECRUITER -> CLIENT)')
        setRole('CLIENT')
        roleInitialized.current = true
      } else {
        // No role param, mark as initialized with default
        roleInitialized.current = true
      }
    }
    // Note: If no roleParam, keep the current state (default 'TALENT' or user's selection)

    // Handle Google OAuth callback for registration
    const token = searchParams.get('token')
    const googleAuth = searchParams.get('google')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      const errorDetails = searchParams.get('details')
      let errorMessage = ''
      
      switch (errorParam) {
        case 'oauth_failed':
        case 'oauth_error':
          errorMessage = 'Google authentication failed. Please try again or use email/password signup.'
          break
        case 'oauth_cancelled':
          errorMessage = 'Google sign-in was cancelled. Please click "Sign up with Google" again and make sure to allow access, or use email/password signup instead.'
          break
        case 'oauth_invalid':
          errorMessage = 'Invalid authentication request. Please try again or use email/password signup.'
          break
        case 'oauth_not_configured':
          errorMessage = 'Google sign-in is not configured. Please check your environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) or use email/password signup instead. See SETUP_GOOGLE_OAUTH.md for setup instructions.'
          break
        case 'no_email':
          errorMessage = 'Could not retrieve email from Google account. Please try again or use email/password signup.'
          break
        default:
          errorMessage = errorDetails 
            ? `An error occurred: ${errorDetails}. Please try again or use email/password signup.`
            : 'An error occurred during authentication. Please try again or use email/password signup.'
      }
      
      setError(errorMessage)
    }

    // Google OAuth callback is now handled by /auth/callback page
    // This page should not receive OAuth callbacks directly
    // If token is present, redirect to callback page
    if (token && googleAuth === 'true') {
      window.location.href = `/auth/callback?token=${encodeURIComponent(token)}&google=true`
      return
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate role is selected
    if (!role || (role !== 'TALENT' && role !== 'CLIENT')) {
      setError('Please select a role (Talent or Client) before signing up.')
      return
    }
    
    // Validate CLIENT has company name
    if (role === 'CLIENT' && !companyName.trim()) {
      setError('Company name is required for Client accounts.')
      return
    }
    
    setLoading(true)

    console.log('[Register] Submitting with role:', role)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          role,
          companyName: role === 'CLIENT' ? companyName : undefined
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Registration failed')
      }

      // Check if email verification is required
      if (data.data.requiresVerification) {
        // Store email and role in sessionStorage for verification page
        try {
          sessionStorage.setItem('register_email', email)
          sessionStorage.setItem('register_role', role)
          console.log('[Register] Stored email and role in sessionStorage for verification')
        } catch (e) {
          console.warn('[Register] Could not store in sessionStorage:', e)
        }
        
        // Redirect to verification page
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
        return
      }

        // Auto-login after successful registration (email is confirmed)
        // Use user data directly from register response
        const userData = data.data?.user
        if (userData && data.data.emailVerified) {
          console.log('[Register] Auto-login enabled, user data:', userData)
          
          // Get role directly from response
          const userRole = userData.role
          console.log('[Register] User role from response:', userRole)

          // Store user data in sessionStorage FIRST - before any delays
          // This ensures auth context can recognize user immediately after redirect
          // Same pattern as OAuth callback
          try {
            sessionStorage.setItem('oauth_user', JSON.stringify({
              id: userData.id,
              email: userData.email,
              role: userRole,
              name: userData.name,
              status: userData.status || 'ACTIVE'
            }))
            console.log('[Register] Stored user data in sessionStorage for immediate auth recognition')
          } catch (e) {
            console.warn('[Register] Could not store in sessionStorage:', e)
          }

          // Wait a bit for cookie to be set in browser
          // Reduced delay since we're using sessionStorage for immediate recognition
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Try to verify cookie is set by fetching user data (optional, with retry)
          let cookieVerified = false
          let retries = 0
          const maxRetries = 2 // Reduced retries since sessionStorage is already set
          
          while (retries < maxRetries && !cookieVerified) {
            try {
              const meResponse = await fetch('/api/auth/me', {
                credentials: 'include',
              })

              if (meResponse.ok) {
                const meResponseData = await meResponse.json()
                if (meResponseData.success && meResponseData.data) {
                  cookieVerified = true
                  console.log('[Register] Cookie verified, user authenticated:', meResponseData.data.role)
                  break
                }
              } else {
                console.log(`[Register] Cookie not ready yet (attempt ${retries + 1}/${maxRetries}), status:`, meResponse.status)
                await new Promise(resolve => setTimeout(resolve, 500))
              }
            } catch (fetchError) {
              console.error('[Register] Error verifying cookie:', fetchError)
              await new Promise(resolve => setTimeout(resolve, 500))
            }
            retries++
          }

          // Redirect even if cookie verification failed (cookie might be set but not immediately readable)
          // sessionStorage is already set, so auth context will recognize user
          console.log('[Register] Redirecting based on role:', userRole)

        // Redirect to appropriate dashboard based on role
        if (userRole === 'SUPER_ADMIN' || userRole === 'QUALITY_ADMIN' || userRole === 'SUPPORT_ADMIN' || userRole === 'ANALYST' || userRole === 'ADMIN') {
          console.log('[Register] Redirecting to admin dashboard')
          window.location.replace('/admin/dashboard')
        } else if (userRole === 'TALENT') {
          console.log('[Register] Redirecting to talent onboarding')
          // For new TALENT users, always redirect to onboarding
          window.location.replace('/talent/onboarding')
        } else if (userRole === 'CLIENT') {
          console.log('[Register] Redirecting to client dashboard')
          // CLIENT users go directly to dashboard (no onboarding required)
          window.location.replace('/client')
        } else {
          console.log('[Register] Redirecting to default dashboard')
          window.location.replace('/dashboard')
        }
        return
      }

      // If email verification required, redirect to verify page
      if (data.data.requiresVerification) {
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
        return
      }

      // Fallback: redirect to login if we can't auto-login
      console.log('[Register] Fallback: redirecting to login')
      window.location.href = `/login?registered=true&email=${encodeURIComponent(email)}&role=${role}`
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      console.error('Registration error:', err)
      
      // If error is about email verification, redirect to verify-email page
      if (errorMessage.includes('check your email') || errorMessage.includes('verify')) {
        // User will be redirected to verify-email page by register function
        // Don't show as error
        return
      }
      
      // Show more specific error message
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead or use a different email address.')
      } else if (errorMessage.includes('validation')) {
        setError('Please check your input and try again. Make sure your email is valid and password is at least 8 characters.')
      } else if (errorMessage.includes('password')) {
        setError('Password must be at least 8 characters long.')
      } else {
        setError(errorMessage || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-2xl py-20 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Sign Up</h1>
          <p className="text-gray-600">Create your account on Monera</p>
        </div>

        {/* Role Selection */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">I want to join as:</CardTitle>
            <CardDescription className="mt-2">Select your role to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log('[Register] Setting role to TALENT')
                  setRole('TALENT')
                  setError('') // Clear any previous errors
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  role === 'TALENT'
                    ? 'border-brand-purple bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${role === 'TALENT' ? 'text-brand-purple' : 'text-gray-400'}`}>
                    💼
                  </div>
                  <div className={`font-semibold text-lg ${role === 'TALENT' ? 'text-brand-purple' : 'text-gray-700'}`}>
                    Talent
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Find quality jobs
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('[Register] Setting role to CLIENT')
                  setRole('CLIENT')
                  setError('') // Clear any previous errors
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  role === 'CLIENT'
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl mb-2 ${role === 'CLIENT' ? 'text-indigo-600' : 'text-gray-400'}`}>
                    🏢
                  </div>
                  <div className={`font-semibold text-lg ${role === 'CLIENT' ? 'text-indigo-600' : 'text-gray-700'}`}>
                    Client / Company
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Hire vetted talent
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              {role === 'TALENT'
                ? 'Create your talent profile and start finding quality jobs'
                : 'Create your client account and start hiring vetted talent'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              {role === 'CLIENT' && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name (e.g., Samsung, OpenAI)"
                  />
                  <p className="text-xs text-gray-500">
                    This will be used to identify your company in job postings
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-brand-purple hover:bg-purple-700" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-2 hover:bg-gray-50"
              onClick={() => {
                if (!role) {
                  setError('Please select a role (Talent or Client) before signing up with Google')
                  return
                }
                console.log('[Register] Initiating Google OAuth signup with role:', role)
                window.location.href = `/api/auth/google?register=true&role=${role}`
              }}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Processing...' : `Sign up with Google as ${role === 'TALENT' ? 'Talent' : 'Client'}`}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-purple hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
