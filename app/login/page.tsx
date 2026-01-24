'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Set page title
    document.title = 'Monera Login - Login to your monera account'

    // Handle registration success redirect
    const registered = searchParams.get('registered')
    const registeredEmail = searchParams.get('email')
    if (registered === 'true') {
      setSuccess('Registration successful! Please sign in to continue.')
      if (registeredEmail) {
        setEmail(registeredEmail) // Pre-fill email
      }
    }

    // Handle password reset success
    const passwordReset = searchParams.get('password_reset')
    if (passwordReset === 'true') {
      setSuccess('Password has been reset successfully! You can now login with your new password.')
    }

    // Handle Google OAuth callback
    const token = searchParams.get('token')
    const googleAuth = searchParams.get('google')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      const details = searchParams.get('details')
      let errorMessage = ''
      
      if (errorParam === 'oauth_failed') {
        errorMessage = 'Google authentication failed. Please try again.'
        if (details) {
          errorMessage += ` (${details})`
        }
      } else if (errorParam === 'no_email') {
        errorMessage = 'Could not retrieve email from Google account.'
      } else if (errorParam === 'account_not_found') {
        errorMessage = 'Account not found. Please sign up first.'
      } else if (errorParam === 'oauth_error') {
        errorMessage = 'An error occurred during Google authentication. Please try again.'
      } else {
        errorMessage = 'An error occurred during authentication.'
        if (details) {
          errorMessage += ` (${details})`
        }
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
    setLoading(true)

    try {
      // Call login API directly to get user data in response
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      
      const loginData = await loginResponse.json()
      
      if (!loginData.success) {
        // Check if email verification is required
        if (loginData.requiresVerification && loginData.email) {
          // Redirect to verification page
          router.push(`/verify-email?email=${encodeURIComponent(loginData.email)}`)
          return
        }
        throw new Error(loginData.error || 'Login failed')
      }
      
      // Use user data directly from login response (most reliable)
      const userData = loginData.data?.user
      if (userData) {
        const role = userData.role
        const status = userData.status || 'DRAFT'
        
        // Update auth context to ensure user state is set
        // The login function will update the user state in context
        await login(email, password)
        
        // Wait longer for cookies to be fully set and context to update
        // This ensures the auth-token cookie is properly set before redirect
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Verify cookie is set by making a test request
        try {
          const testResponse = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!testResponse.ok) {
            console.warn('[Login] Cookie verification failed, but proceeding with redirect')
          } else {
            console.log('[Login] Cookie verified, proceeding with redirect')
          }
        } catch (error) {
          console.error('[Login] Error verifying cookie:', error)
        }
        
        // Immediately redirect based on role and status
        if (role === 'SUPER_ADMIN' || role === 'QUALITY_ADMIN' || role === 'SUPPORT_ADMIN' || role === 'ANALYST' || role === 'ADMIN') {
          window.location.href = '/admin/dashboard'
        } else if (role === 'TALENT') {
          // Redirect to /talent page (which will handle onboarding/dashboard logic)
          window.location.href = '/talent'
        } else if (role === 'CLIENT') {
          window.location.href = '/client'
        } else {
          window.location.href = '/dashboard'
        }
        return
      }
      
      // Fallback: fetch user data with retry logic
      let meData = null
      let retries = 5
      let delay = 300
      
      while (retries > 0 && !meData) {
        try {
          await new Promise(resolve => setTimeout(resolve, delay))
          
          const meResponse = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (meResponse.ok) {
            const data = await meResponse.json()
            if (data.success) {
              meData = data
              break
            }
          }
        } catch (fetchError) {
          console.error('Error fetching user data:', fetchError)
        }
        
        retries--
        delay += 100 // Increase delay for each retry
      }
      
      if (!meData || !meData.success) {
        throw new Error('Failed to get user data after login. Please try again.')
      }
      
      const role = meData.data.role
      const status = meData.data.status || 'DRAFT'
      
      // Check for redirect parameter
      const redirectParam = searchParams.get('redirect')
      
      // Immediately redirect based on role and status
      // If redirect param exists and user has access, use it
      if (redirectParam) {
        // Validate redirect path (must start with / and not be external)
        if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
          // Check if user has access to the redirect path
          const isClientPath = redirectParam.startsWith('/client')
          const isTalentPath = redirectParam.startsWith('/talent')
          const isAdminPath = redirectParam.startsWith('/admin')
          
          if ((role === 'CLIENT' && isClientPath) || 
              (role === 'TALENT' && isTalentPath) ||
              ((role === 'SUPER_ADMIN' || role === 'QUALITY_ADMIN' || role === 'SUPPORT_ADMIN' || role === 'ANALYST' || role === 'ADMIN') && isAdminPath)) {
            console.log('[Login] Redirecting to requested path:', redirectParam)
            window.location.href = redirectParam
            return
          }
        }
      }
      
      // Default redirects based on role
      if (role === 'SUPER_ADMIN' || role === 'QUALITY_ADMIN' || role === 'SUPPORT_ADMIN' || role === 'ANALYST' || role === 'ADMIN') {
        window.location.href = '/admin/dashboard'
      } else if (role === 'TALENT') {
        // Redirect to /talent page (which will handle onboarding/dashboard logic)
        window.location.href = '/talent'
      } else if (role === 'CLIENT') {
        window.location.href = '/client'
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md py-20 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-gray-600 mt-2">Welcome back to Monera</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-brand-purple hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
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
          className="w-full"
          onClick={() => {
            window.location.href = '/api/auth/google'
          }}
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
          Login with Google
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-brand-purple hover:underline">
            Sign up
          </a>
        </p>

      </div>
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
