'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface OnboardingData {
  firstName: string
  lastName: string
  phone: string
  companyName: string
  companyWebsite: string
  companyDescription: string
}

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Get started' },
  { id: 2, title: 'Personal Info', description: 'Your details' },
  { id: 3, title: 'Company Info', description: 'Company details' },
  { id: 4, title: 'Complete', description: 'Success!' },
]

export default function ClientOnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    companyWebsite: '',
    companyDescription: '',
  })

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      // Wait for auth context to finish loading
      // Give it more time if still loading
      if (loading) {
        console.log('[ClientOnboarding] Auth still loading, waiting...')
        // Wait up to 3 seconds for auth to load
        let waitCount = 0
        while (loading && waitCount < 30 && mounted) {
          await new Promise(resolve => setTimeout(resolve, 100))
          waitCount++
        }
      }

      if (!mounted) return

      // If still loading after wait, check directly via API
      if (loading) {
        console.log('[ClientOnboarding] Still loading after wait, checking via API...')
        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' })
          const meData = await meRes.json()
          
          if (meData.success && meData.data) {
            // User is authenticated, but auth context hasn't updated yet
            // Wait a bit more for context to catch up
            console.log('[ClientOnboarding] User authenticated via API, waiting for context...')
            await new Promise(resolve => setTimeout(resolve, 500))
            
            if (!mounted) return
            
            // Check again if user is now available in context
            if (!user && meData.data.role === 'CLIENT') {
              // User is CLIENT and authenticated, proceed
              console.log('[ClientOnboarding] Proceeding with authenticated CLIENT user')
              setPageLoading(false)
              return
            }
          } else {
            // Not authenticated, redirect to login with redirect param
            console.log('[ClientOnboarding] Not authenticated, redirecting to login')
            router.push(`/login?redirect=${encodeURIComponent('/client/onboarding')}`)
            return
          }
        } catch (error) {
          console.error('[ClientOnboarding] Auth check error:', error)
          router.push(`/login?redirect=${encodeURIComponent('/client/onboarding')}`)
          return
        }
      }

      // Check user from context
      if (!user) {
        console.log('[ClientOnboarding] No user in context, redirecting to login')
        router.push(`/login?redirect=${encodeURIComponent('/client/onboarding')}`)
        return
      }

      if (user.role !== 'CLIENT') {
        console.log('[ClientOnboarding] User is not CLIENT, redirecting to home')
        router.push('/')
        return
      }

      console.log('[ClientOnboarding] User authenticated as CLIENT, proceeding')

      // Fetch existing profile data
      try {
        const profileRes = await fetch('/api/user/profile', { credentials: 'include' })
        const profileData = await profileRes.json()
        
        if (profileData.success && profileData.data) {
          const data = profileData.data
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            companyName: data.company?.name || '',
            companyWebsite: data.company?.website || '',
            companyDescription: data.company?.description || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }

      setPageLoading(false)
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [user, loading, router])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/client/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save profile')
      }

      // Move to completion step
      setCurrentStep(STEPS.length)
      
      // Redirect to client dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/client'
      }, 2000)
    } catch (error) {
      console.error('Submission error:', error)
      alert(error instanceof Error ? error.message : 'Failed to save profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'CLIENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id
                        ? 'bg-brand-purple text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="mt-2 text-xs text-center">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.id ? 'bg-brand-purple' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Welcome to Monera!'}
              {currentStep === 2 && 'Personal Information'}
              {currentStep === 3 && 'Company Information'}
              {currentStep === 4 && 'Profile Complete!'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Let\'s set up your client profile'}
              {currentStep === 2 && 'Tell us about yourself'}
              {currentStep === 3 && 'Tell us about your company'}
              {currentStep === 4 && 'Your profile has been set up successfully'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-xl font-semibold mb-2">Welcome, {user.email?.split('@')[0]}!</h2>
                  <p className="text-gray-600">
                    We're excited to have you on board. Let's complete your profile so you can start posting jobs and hiring talent.
                  </p>
                </div>
                <Button onClick={handleNext} className="w-full bg-brand-purple hover:bg-purple-700">
                  Get Started
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-brand-purple hover:bg-purple-700">
                    Next
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    rows={4}
                    value={formData.companyDescription}
                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                    placeholder="Tell us about your company..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.companyDescription.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1 bg-brand-purple hover:bg-purple-700">
                    {submitting ? 'Saving...' : 'Complete Setup'}
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 4 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-semibold mb-2">Profile Complete!</h2>
                <p className="text-gray-600 mb-6">
                  Your client profile has been set up successfully. Redirecting to your dashboard...
                </p>
                <Button onClick={() => router.push('/client')} className="bg-brand-purple hover:bg-purple-700">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
