'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface OnboardingData {
  // Step 1: Identity
  fullName: string
  country: string
  timezone: string
  
  // Step 2: Skills
  skillIds: string[]
  
  // Step 3: Experience
  experience: string
  portfolioUrl: string
  
  // Step 4: Video
  introVideoUrl: string | null
}

const STEPS = [
  { id: 1, title: 'Identity', description: 'Basic information' },
  { id: 2, title: 'Skills', description: 'Your expertise' },
  { id: 3, title: 'Experience', description: 'Portfolio & background' },
  { id: 4, title: 'Video Intro', description: 'Introduce yourself' },
]

// Countries list
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
  'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia',
  'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia',
  'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam'
].sort()

// Timezones list
const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00',
  'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00',
  'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+05:30', 'UTC+06:00', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00', 'UTC+13:00', 'UTC+14:00'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    country: '',
    timezone: '',
    skillIds: [],
    experience: '',
    portfolioUrl: '',
    introVideoUrl: null,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          fetch('/api/user/profile', { credentials: 'include' }),
          fetch('/api/skills', { credentials: 'include' })
        ])

        const [profileData, skillsData] = await Promise.all([
          profileRes.json(),
          skillsRes.json()
        ])

        if (profileData.success && profileData.data) {
          const profile = profileData.data
          if (profile.status === 'APPROVED') {
            router.push('/talent/dashboard')
            return
          }
          setFormData(prev => ({
            ...prev,
            fullName: profile.fullName || '',
            country: profile.country || '',
            timezone: profile.timezone || '',
            skillIds: profile.skills?.map((s: any) => s.id) || [],
            experience: profile.experience || '',
            portfolioUrl: profile.portfolioUrl || '',
            introVideoUrl: profile.introVideoUrl || null,
          }))
        }

        if (skillsData.success) {
          setSkills(skillsData.data || [])
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/user/profile/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        router.push('/user/status')
      } else {
        const errorMessage = data.error || data.message || 'Failed to submit profile'
        alert(errorMessage)
        console.error('Profile submission error:', data)
      }
    } catch (error) {
      console.error('Error submitting profile:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  // Show guide for new talent users
  if (showGuide) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <Card className="border-2 border-brand-purple">
          <CardHeader className="text-center bg-gradient-to-br from-brand-purple to-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold mb-2">Welcome to Monera Talent Onboarding! 🎉</CardTitle>
            <CardDescription className="text-purple-100 text-lg">
              Let's get you started on your journey to becoming a Monera Talent
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">📹</span>
                Important: Video Introduction Required
              </h3>
              <p className="text-blue-800 mb-3">
                Before you begin, please prepare yourself to record a video introduction. This is a crucial part of your application.
              </p>
              <div className="bg-white p-4 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📋 What You Need to Prepare:</h4>
                <ul className="list-disc list-inside space-y-2 text-blue-800">
                  <li><strong>Language:</strong> Record your video in <strong className="text-blue-900">English</strong></li>
                  <li><strong>Content:</strong> 
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Introduce yourself (your name, background, and experience)</li>
                      <li>Explain your skills and expertise</li>
                      <li>Share why you're interested in joining Monera</li>
                    </ul>
                  </li>
                  <li><strong>Duration:</strong> Keep it concise and professional (2-5 minutes recommended)</li>
                  <li><strong>Quality:</strong> Ensure good lighting and clear audio</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">What to Expect:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <h4 className="font-semibold mb-1">Identity</h4>
                  <p className="text-sm text-gray-600">Basic information about yourself</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <h4 className="font-semibold mb-1">Skills</h4>
                  <p className="text-sm text-gray-600">Select your expertise areas</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">3️⃣</div>
                  <h4 className="font-semibold mb-1">Experience</h4>
                  <p className="text-sm text-gray-600">Portfolio and background</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl mb-2">4️⃣</div>
                  <h4 className="font-semibold mb-1">Video Intro</h4>
                  <p className="text-sm text-gray-600">Upload your introduction video</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Tip:</strong> Take your time to prepare a quality video. This is your chance to make a great first impression with potential clients!
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                className="bg-brand-purple hover:bg-purple-700 text-white px-8 py-6 text-lg font-semibold"
                onClick={() => setShowGuide(false)}
              >
                I'm Ready - Let's Start! 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select
                  id="country"
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                  required
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone *</Label>
                <Select
                  id="timezone"
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  required
                >
                  <option value="">Select a timezone</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <Label>Select Your Skills *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border p-4 rounded-md">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.skillIds.includes(skill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            skillIds: [...formData.skillIds, skill.id],
                          })
                        } else {
                          setFormData({
                            ...formData,
                            skillIds: formData.skillIds.filter((id) => id !== skill.id),
                          })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>Introduction Video *</Label>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                  <p className="text-sm text-blue-900 font-semibold mb-2">📹 Video Requirements:</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Record in <strong>English</strong></li>
                    <li>Introduce yourself (name, background, experience)</li>
                    <li>Explain your skills and expertise</li>
                    <li>Keep it professional (2-5 minutes recommended)</li>
                    <li>Max file size: 100MB</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your introduction video (max 100MB)
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Upload video to Supabase storage
                      const uploadFormData = new FormData()
                      uploadFormData.append('file', file)
                      
                      try {
                        const response = await fetch('/api/user/upload-video', {
                          method: 'POST',
                          credentials: 'include',
                          body: uploadFormData,
                        })
                        
                        const data = await response.json()
                        if (data.success) {
                          setFormData({ ...formData, introVideoUrl: data.data.url })
                        } else {
                          alert(data.error || 'Failed to upload video')
                        }
                      } catch (error) {
                        console.error('Error uploading video:', error)
                        alert('Failed to upload video. Please try again.')
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {formData.introVideoUrl && (
                  <p className="text-sm text-green-600 mt-2">✓ Video uploaded successfully</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!formData.fullName || !formData.country || !formData.timezone)) ||
                  (currentStep === 2 && formData.skillIds.length === 0) ||
                  (currentStep === 3 && !formData.experience) ||
                  (currentStep === 4 && !formData.introVideoUrl)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Profile'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
