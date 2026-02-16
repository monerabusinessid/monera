'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/footer'
import { Logo } from '@/components/logo'
import Link from 'next/link'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'TALENT' | 'CLIENT'>('TALENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRoleIcons] = useState(true)
  const [roleLocked, setRoleLocked] = useState(false)
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
        setRoleLocked(true)
        roleInitialized.current = true
      } else if (roleParam === 'CANDIDATE') {
        // Backward compatibility: map CANDIDATE to TALENT
        console.log('[Register] Setting role from URL param (CANDIDATE -> TALENT)')
        setRole('TALENT')
        setRoleLocked(true)
        roleInitialized.current = true
      } else if (roleParam === 'RECRUITER') {
        // Backward compatibility: map RECRUITER to CLIENT
        console.log('[Register] Setting role from URL param (RECRUITER -> CLIENT)')
        setRole('CLIENT')
        setRoleLocked(true)
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
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate role is selected
    if (!role || (role !== 'TALENT' && role !== 'CLIENT')) {
      setError('Please select a role (Talent or Client) before signing up.')
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
          role
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
          console.log('[Register] Redirecting to admin')
          window.location.replace('/admin')
        } else if (userRole === 'TALENT') {
          console.log('[Register] Redirecting to talent onboarding')
          // For new TALENT users, always redirect to onboarding
          window.location.replace('/talent/onboarding')
        } else if (userRole === 'CLIENT') {
          console.log('[Register] Redirecting to client onboarding')
          window.location.replace('/client/onboarding')
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
    <div className="auth-page bg-[#f6f6f8] text-gray-900 min-h-screen relative overflow-x-hidden">
      <div className="auth-bg">
        <div className="auth-blob blob-1 animate-blob"></div>
        <div className="auth-blob blob-2 animate-blob animation-delay-2000"></div>
        <div className="auth-blob blob-3 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="glass-panel w-full max-w-[980px] rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Logo size="sm" />
            </div>
            <div className="mb-8 text-center">
              <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight mb-2">Create your account</h1>
              <p className="text-gray-500 text-base font-normal">Join Monera and start your tailored onboarding.</p>
            </div>
            <div className="mb-8">
              <p className="text-center text-sm font-medium text-gray-700 mb-4">Choose your role</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative block cursor-pointer group ${roleLocked ? 'cursor-not-allowed' : ''}`}>
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    value="TALENT"
                    checked={role === 'TALENT'}
                    disabled={roleLocked}
                    onChange={() => {
                      if (roleLocked) return
                      console.log('[Register] Setting role to TALENT')
                      setRole('TALENT')
                      setError('')
                    }}
                  />
                  <div className={`p-5 rounded-xl border-2 border-transparent bg-white/60 shadow-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-white/80 peer-checked:shadow-lg peer-checked:shadow-primary/10 flex items-start gap-4 ${roleLocked ? 'opacity-80' : ''}`}>
                    {showRoleIcons && (
                      <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          alt="Talent icon"
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-gray-900">Talent</h3>
                        <span className={`text-primary transition-opacity text-[20px] ${role === 'TALENT' ? 'opacity-100' : 'opacity-0'}`}>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M9 12.5l2 2 4-4 1.4 1.4-5.4 5.4-3.4-3.4L9 12.5z" />
                          </svg>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">I am a talent looking for work opportunities and projects.</p>
                    </div>
                  </div>
                </label>
                <label className={`relative block cursor-pointer group ${roleLocked ? 'cursor-not-allowed' : ''}`}>
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    value="CLIENT"
                    checked={role === 'CLIENT'}
                    disabled={roleLocked}
                    onChange={() => {
                      if (roleLocked) return
                      console.log('[Register] Setting role to CLIENT')
                      setRole('CLIENT')
                      setError('')
                    }}
                  />
                  <div className={`p-5 rounded-xl border-2 border-transparent bg-white/60 shadow-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-white/80 peer-checked:shadow-lg peer-checked:shadow-primary/10 flex items-start gap-4 ${roleLocked ? 'opacity-80' : ''}`}>
                    {showRoleIcons && (
                      <div className="flex-shrink-0 size-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                          alt="Client icon"
                          className="w-6 h-6"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold text-gray-900">Client</h3>
                        <span className={`text-primary transition-opacity text-[20px] ${role === 'CLIENT' ? 'opacity-100' : 'opacity-0'}`}>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M9 12.5l2 2 4-4 1.4 1.4-5.4 5.4-3.4-3.4L9 12.5z" />
                          </svg>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">I am a hirer looking to find talent for my projects.</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
              )}
              <label className="block">
                <p className="text-gray-900 text-sm font-medium leading-normal pb-2">Email Address</p>
                <div className="relative">
                  <Input
                    className="auth-input h-12 pl-11 pr-4"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.01L12 12 4 6.01V6z" />
                      <path d="M4 8.25V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.25l-7.4 4.7a2 2 0 0 1-2.2 0L4 8.25z" />
                    </svg>
                  </div>
                </div>
              </label>
              <label className="block">
                <p className="text-gray-900 text-sm font-medium leading-normal pb-2">Password</p>
                <div className="relative">
                  <Input
                    className="auth-input h-12 pl-11 pr-4"
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm3 8V7a3 3 0 1 0-6 0v3h6z" />
                    </svg>
                  </div>
                </div>
              </label>
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg h-12 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2" type="submit" disabled={loading}>
                <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M4 10a1 1 0 0 1 1-1h7.586l-2.293-2.293a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 1 1-1.414-1.414L12.586 11H5a1 1 0 0 1-1-1z" />
                </svg>
              </button>
            </form>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/50 text-gray-500 backdrop-blur-sm rounded">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button
                className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white/50 backdrop-blur-sm"
                type="button"
                onClick={() => {
                  window.location.href = `/api/auth/google?register=true&role=${role}`
                }}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.5 3.6-5.4 3.6-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 8.6-4.9 8.6-7.5 0-.5-.1-.9-.1-1.3H12z" />
                  <path fill="#34A853" d="M3.7 7.1l3.2 2.3c.9-1.7 2.7-2.8 4.9-2.8 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.3 14.5 2.4 12 2.4c-3.4 0-6.3 1.8-7.9 4.7z" />
                  <path fill="#FBBC05" d="M12 20.8c2.5 0 4.6-.8 6.1-2.2l-2.8-2.3c-.8.6-2 1.1-3.3 1.1-3.2 0-5.8-2.7-5.8-6 0-.7.1-1.4.4-2l-3.2-2.3C2.9 8.5 2.8 10 2.8 11.6c0 5.1 4.1 9.2 9.2 9.2z" />
                  <path fill="#4285F4" d="M20.6 12.3c0-.5-.1-.9-.1-1.3H12v3.9h5.4c-.3 1.5-1.4 2.7-3 3.4l2.8 2.3c1.7-1.6 2.6-4 2.6-8.3z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
            </div>
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .auth-page {
          background: #f6f6f8;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .auth-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(64px);
          opacity: 0.6;
          mix-blend-mode: multiply;
        }
        .blob-1 {
          top: -10%;
          left: -5%;
          width: 520px;
          height: 520px;
          background: rgba(111, 3, 205, 0.25);
        }
        .blob-2 {
          bottom: -10%;
          right: -5%;
          width: 620px;
          height: 620px;
          background: rgba(59, 130, 246, 0.2);
        }
        .blob-3 {
          top: 40%;
          left: 40%;
          width: 420px;
          height: 420px;
          background: rgba(168, 85, 247, 0.2);
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        .auth-input {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #dbdbe6;
          color: #111118;
        }
        .auth-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(111, 3, 205, 0.3);
          border-color: #6f03cd;
        }
        .animate-blob {
          animation: blob 14s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
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
