'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registerRole, setRegisterRole] = useState<'TALENT' | 'CLIENT'>('TALENT')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoRedirected = useRef(false)

  const getTalentRedirectFromData = (data: any) => {
    const status = data?.talentProfile?.status || 'DRAFT'
    return status === 'DRAFT' ? '/talent/onboarding' : '/talent'
  }

  const getTalentRedirect = async () => {
    try {
      const meResponse = await fetch('/api/auth/me', { credentials: 'include' })
      if (!meResponse.ok) return '/talent'
      const meData = await meResponse.json()
      return getTalentRedirectFromData(meData?.data)
    } catch {
      return '/talent'
    }
  }

  const getClientRedirect = async () => {
    // Always redirect to /client dashboard
    return '/client'
  }

  useEffect(() => {
    document.title = 'Monera Login - Login to your monera account'

    const registered = searchParams.get('registered')
    const registeredEmail = searchParams.get('email')
    if (registered === 'true') {
      setSuccess('Registration successful! Please sign in to continue.')
      if (registeredEmail) setEmail(registeredEmail)
    }

    const passwordReset = searchParams.get('password_reset')
    if (passwordReset === 'true') {
      setSuccess('Password has been reset successfully! You can now login with your new password.')
    }

    const errorParam = searchParams.get('error')
    if (errorParam) {
      const details = searchParams.get('details')
      let errorMessage = ''
      
      if (errorParam === 'oauth_failed') {
        errorMessage = 'Google authentication failed. Please try again.'
        if (details) errorMessage += ` (${details})`
      } else if (errorParam === 'no_email') {
        errorMessage = 'Could not retrieve email from Google account.'
      } else if (errorParam === 'account_not_found') {
        errorMessage = 'Account not found. Please sign up first.'
      } else if (errorParam === 'oauth_error') {
        errorMessage = 'An error occurred during Google authentication. Please try again.'
      } else {
        errorMessage = 'An error occurred during authentication.'
        if (details) errorMessage += ` (${details})`
      }
      
      setError(errorMessage)
    }

    const token = searchParams.get('token')
    const googleAuth = searchParams.get('google')
    if (token && googleAuth === 'true') {
      window.location.href = `/auth/callback?token=${encodeURIComponent(token)}&google=true`
    }
  }, [searchParams])

  useEffect(() => {
    if (autoRedirected.current) return

    const attemptAutoRedirect = async () => {
      try {
        const meResponse = await fetch('/api/auth/me', { credentials: 'include' })
        if (!meResponse.ok) return
        const meData = await meResponse.json()
        if (!meData?.success || !meData?.data?.role) return

        autoRedirected.current = true
        const role = meData.data.role
        const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN']
        const redirectParam = searchParams.get('redirect')

        if (redirectParam?.startsWith('/') && !redirectParam.startsWith('//')) {
          if ((role === 'CLIENT' && redirectParam.startsWith('/client')) || 
              (role === 'TALENT' && redirectParam.startsWith('/talent')) ||
              (adminRoles.includes(role) && redirectParam.startsWith('/admin'))) {
            window.location.href = redirectParam
            return
          }
        }

        if (adminRoles.includes(role)) {
          window.location.href = '/admin'
        } else if (role === 'TALENT') {
          window.location.href = getTalentRedirectFromData(meData.data)
        } else if (role === 'CLIENT') {
          window.location.href = await getClientRedirect()
        }
      } catch (err) {
        console.warn('[Login] Auto-redirect check failed:', err)
      }
    }

    attemptAutoRedirect()
  }, [searchParams])

  useEffect(() => {
    if (!user || authLoading) return

    const redirect = async () => {
      const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN']
      const redirectParam = searchParams.get('redirect')
      
      // Add a small delay to prevent immediate redirect conflicts
      await new Promise(resolve => setTimeout(resolve, 100))

      if (redirectParam?.startsWith('/') && !redirectParam.startsWith('//')) {
        if ((user.role === 'CLIENT' && redirectParam.startsWith('/client')) || 
            (user.role === 'TALENT' && redirectParam.startsWith('/talent')) ||
            (adminRoles.includes(user.role) && redirectParam.startsWith('/admin'))) {
          window.location.href = redirectParam
          return
        }
      }

      if (adminRoles.includes(user.role)) {
        console.log('[Login] Redirecting admin user to /admin')
        window.location.href = '/admin'
      } else if (user.role === 'TALENT') {
        console.log('[Login] Redirecting talent user')
        window.location.href = await getTalentRedirect()
      } else if (user.role === 'CLIENT') {
        console.log('[Login] Redirecting client user')
        const clientRedirect = await getClientRedirect()
        window.location.href = clientRedirect
      }
    }

    redirect()
  }, [user, authLoading, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        if (result.requiresVerification && result.email) {
          router.push(`/verify-email?email=${encodeURIComponent(result.email)}`)
          return
        }
        throw new Error(result.error || 'Login failed')
      }
      // Redirect will be handled by the user effect after context updates
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page bg-[#f6f6f8] text-gray-900 min-h-screen relative overflow-x-hidden">
      <div className="auth-bg">
        <div className="auth-blob blob-1 animate-blob"></div>
        <div className="auth-blob blob-2 animate-blob animation-delay-2000"></div>
        <div className="auth-blob blob-3 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="glass-panel w-full max-w-[1100px] rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-8 md:p-12 lg:pr-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-200/50">
            <div className="flex items-center gap-3 mb-8">
              <Logo size="sm" />
            </div>
            <div className="mb-8">
              <h1 className="text-gray-900 text-3xl font-bold leading-tight tracking-tight mb-2">Welcome Back</h1>
              <p className="text-gray-500 text-base font-normal">Enter your details to access your workspace.</p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <p className="text-gray-900 text-sm font-medium leading-normal pb-2">Email Address</p>
                <div className="relative">
                  <Input
                    className="auth-input h-12 pl-11 pr-4"
                    placeholder="john@example.com"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <div className="flex justify-between items-center pb-2">
                  <p className="text-gray-900 text-sm font-medium leading-normal">Password</p>
                  <Link className="text-primary text-sm font-medium hover:text-primary/80 transition-colors" href="/forgot-password">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    className="auth-input h-12 pl-11 pr-4"
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm3 8V7a3 3 0 1 0-6 0v3h6z" />
                    </svg>
                  </div>
                </div>
              </label>
              {success && (
                <div className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
                  {error}
                </div>
              )}
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg h-12 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2" type="submit" disabled={loading}>
                <span>{loading ? 'Logging in...' : 'Log In'}</span>
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
                onClick={() => window.location.href = '/api/auth/google'}
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
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          <div className="flex-1 p-8 md:p-12 bg-gray-50/30 flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">Join Monera</span>
                <span className="text-xs text-gray-500">Join 10,000+ professionals</span>
              </div>
              <h2 className="text-gray-900 text-2xl font-bold leading-tight mb-2">Choose your path</h2>
              <p className="text-gray-500 text-base">Select your account type to get started with a personalized experience.</p>
            </div>
            <div className="space-y-4">
              <label className="relative block cursor-pointer group">
                <input
                  className="peer sr-only"
                  name="role"
                  type="radio"
                  value="TALENT"
                  checked={registerRole === 'TALENT'}
                  onChange={() => setRegisterRole('TALENT')}
                />
                <div className="p-5 rounded-xl border-2 border-transparent bg-white/60 shadow-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-white/80 peer-checked:shadow-lg peer-checked:shadow-primary/10 flex items-start gap-4">
                  <div className="flex-shrink-0 size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      alt="Talent icon"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-gray-900">Talent</h3>
                      <span className={`text-primary transition-opacity text-[20px] ${registerRole === 'TALENT' ? 'opacity-100' : 'opacity-0'}`}>●</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">I am a talent looking for work opportunities and projects.</p>
                  </div>
                </div>
              </label>
              <label className="relative block cursor-pointer group">
                <input
                  className="peer sr-only"
                  name="role"
                  type="radio"
                  value="CLIENT"
                  checked={registerRole === 'CLIENT'}
                  onChange={() => setRegisterRole('CLIENT')}
                />
                <div className="p-5 rounded-xl border-2 border-transparent bg-white/60 shadow-sm transition-all duration-200 peer-checked:border-primary peer-checked:bg-white/80 peer-checked:shadow-lg peer-checked:shadow-primary/10 flex items-start gap-4">
                  <div className="flex-shrink-0 size-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                      alt="Client icon"
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-gray-900">Client</h3>
                      <span className={`text-primary transition-opacity text-[20px] ${registerRole === 'CLIENT' ? 'opacity-100' : 'opacity-0'}`}>●</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">I am a hirer looking to find talent for my projects.</p>
                  </div>
                </div>
              </label>
            </div>
            <div className="mt-8">
              <button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg h-12 transition-all flex items-center justify-center gap-2 group"
                type="button"
                onClick={() => window.location.href = `/register?role=${registerRole}`}
              >
                <span>Get Started</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M4 10a1 1 0 0 1 1-1h7.586l-2.293-2.293a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 1 1-1.414-1.414L12.586 11H5a1 1 0 0 1-1-1z" />
                </svg>
              </button>
              <p className="text-xs text-center text-gray-400 mt-4">
                By continuing, you agree to Monera's <a className="underline hover:text-primary" href="/terms">Terms of Service</a>.
              </p>
            </div>
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
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
