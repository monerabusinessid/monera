'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Handle Supabase password reset callback
    // Supabase redirects with hash fragment containing access_token and type=recovery
    const supabase = createClient()
    
    const handleHash = async () => {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const type = params.get('type')
        
        if (type === 'recovery' && accessToken) {
          try {
            // Set the session using Supabase client
            // This will automatically handle cookies
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: params.get('refresh_token') || '',
            })

            if (sessionError) {
              console.error('[ResetPassword] Error setting session:', sessionError)
              setError('Invalid or expired reset link. Please request a new password reset.')
              return
            }

            if (data.session) {
              console.log('[ResetPassword] Session set successfully')
              setSessionReady(true)
              // Remove hash from URL for cleaner UX
              window.history.replaceState(null, '', window.location.pathname)
            }
          } catch (err) {
            console.error('[ResetPassword] Error:', err)
            setError('Failed to process reset link. Please try again.')
          }
        } else {
          setError('Invalid reset link. Please request a new password reset.')
        }
      } else {
        // Check if we already have a session
        const checkSession = async () => {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setSessionReady(true)
          } else {
            setError('No reset session found. Please request a new password reset.')
          }
        }
        checkSession()
      }
    }

    handleHash()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!sessionReady) {
      setError('Please wait for the reset link to be processed.')
      return
    }

    setLoading(true)

    try {
      // Update the password using the API
      // The session should already be set via Supabase client
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(data.data.message || 'Password has been reset successfully!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?password_reset=true')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center">Reset Password</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={loading || !!success}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={loading || !!success}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !!success || !sessionReady}>
                {loading ? 'Resetting...' : success ? 'Password Reset!' : !sessionReady ? 'Processing...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-brand-purple hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
