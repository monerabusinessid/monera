'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get email from URL params or sessionStorage
    const emailParam = searchParams.get('email')
    const storedEmail = sessionStorage.getItem('register_email')
    const emailToUse = emailParam || storedEmail || ''
    setEmail(emailToUse)

    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [searchParams])

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('')
        const newCode = [...code]
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit
        })
        setCode(newCode)
        if (digits.length === 6) {
          handleVerify(newCode.join(''))
        } else {
          inputRefs.current[Math.min(digits.length, 5)]?.focus()
        }
      })
    }
  }

  const handleVerify = async (codeToVerify?: string) => {
    const codeString = codeToVerify || code.join('')
    
    if (codeString.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    if (!email) {
      setError('Email address is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          code: codeString,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Clear sessionStorage
        sessionStorage.removeItem('register_email')
        
        // Redirect to appropriate dashboard after 2 seconds
        setTimeout(() => {
          // Get role from sessionStorage or redirect to login
          const storedRole = sessionStorage.getItem('register_role')
          if (storedRole === 'TALENT') {
            router.push('/talent')
          } else if (storedRole === 'CLIENT') {
            router.push('/client')
          } else {
            router.push('/login?verified=true')
          }
        }, 2000)
      } else {
        setError(data.error || 'Verification failed. Please check your code and try again.')
        // Clear code on error
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (error: any) {
      console.error('Verification error:', error)
      setError('An error occurred. Please try again.')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || !email) return

    setResending(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setCooldown(data.data?.cooldownSeconds || 60)
        setError('')
        // Show success message (you can add a toast here)
        alert('New verification code sent to your email!')
      } else {
        if (data.retryAfter) {
          setCooldown(data.retryAfter)
        }
        setError(data.error || 'Failed to resend code. Please try again later.')
      }
    } catch (error: any) {
      console.error('Resend error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setResending(false)
    }
  }

  // Mask email for display
  const maskEmail = (email: string) => {
    if (!email) return ''
    const [local, domain] = email.split('@')
    if (!domain) return email
    const maskedLocal = local.length > 2 
      ? local.slice(0, 2) + '*'.repeat(local.length - 2)
      : '*'.repeat(local.length)
    return `${maskedLocal}@${domain}`
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. Redirecting you to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
          </CardDescription>
          {email && (
            <p className="text-sm font-medium text-gray-900 mt-2">
              {maskEmail(email)}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="code" className="text-sm font-medium mb-4 block">
              Enter Verification Code
            </Label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Code expires in 10 minutes
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleVerify()}
              className="w-full bg-brand-purple hover:bg-purple-700"
              disabled={loading || code.some(d => !d)}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="w-full"
              >
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend Code (${cooldown}s)`
                  : 'Resend Code'}
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Wrong email?{' '}
              <Link href="/register" className="text-brand-purple hover:underline font-medium">
                Sign up again
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
