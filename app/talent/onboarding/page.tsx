'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface OnboardingData {
  firstName: string
  lastName: string
  jobTitle: string
  country: string
  timezone: string
  bio: string
  phone: string
  location: string
  hourlyRate?: string
  availability?: string
  linkedInUrl: string
  githubUrl: string
  skillIds: string[]
  customSkills: string[] // Skills yang ditambahkan sendiri
  experience: string
  portfolioUrl: string
  introVideoUrl: string | null
}

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Get started' },
  { id: 2, title: 'Basic Info', description: 'Personal information' },
  { id: 3, title: 'Skills', description: 'Your expertise' },
  { id: 4, title: 'Experience', description: 'Background & introduction' },
  { id: 5, title: 'Complete', description: 'Success!' },
]

// Countries list
const COUNTRIES = [
  'Indonesia', 'United States', 'United Kingdom', 'India', 'Philippines', 'Vietnam',
  'Singapore', 'Malaysia', 'Thailand', 'Australia', 'Canada', 'Germany', 'France',
  'Japan', 'South Korea', 'China', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Netherlands',
  'Poland', 'Ukraine', 'Romania', 'Bangladesh', 'Pakistan', 'Nigeria', 'South Africa',
  'Argentina', 'Chile', 'Colombia', 'Egypt', 'Turkey', 'Saudi Arabia', 'United Arab Emirates'
].sort()

// Timezones list
const TIMEZONES = [
  'UTC+07:00 (WIB - Jakarta)', 'UTC+08:00 (WITA - Bali)', 'UTC+09:00 (WIT - Papua)',
  'UTC-05:00 (EST - New York)', 'UTC-08:00 (PST - Los Angeles)', 'UTC+00:00 (GMT - London)',
  'UTC+05:30 (IST - Mumbai)', 'UTC+08:00 (SGT - Singapore)', 'UTC+09:00 (JST - Tokyo)',
  'UTC+10:00 (AEST - Sydney)', 'UTC+01:00 (CET - Berlin)', 'UTC+02:00 (EET - Cairo)'
]

export default function TalentOnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    country: '',
    timezone: '',
    bio: '',
    phone: '',
    location: '',
    hourlyRate: '',
    availability: 'Open',
    linkedInUrl: '',
    githubUrl: '',
    skillIds: [],
    customSkills: [],
    experience: '',
    portfolioUrl: '',
    introVideoUrl: null,
  })
  const [newSkillName, setNewSkillName] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const isStep2Complete = Boolean(
    formData.firstName &&
      formData.lastName &&
      formData.jobTitle &&
      formData.country &&
      formData.timezone &&
      formData.bio &&
      formData.phone &&
      formData.location
  )
  const isStep4Complete = Boolean(
    formData.experience &&
      formData.experience.length >= 50 &&
      formData.introVideoUrl
  )

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    timeoutId = setTimeout(() => {
      if (mounted) {
        setPageLoading(false)
      }
    }, 3000)

    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))

      if (!mounted) return

      if (loading) {
        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' })
          const meData = await meRes.json()
          
          if (meData.success && meData.data) {
            const currentUser = meData.data
            if (currentUser.role !== 'TALENT') {
              router.push('/login')
              return
            }
          } else {
            router.push('/login')
            return
          }
        } catch (err) {
          console.error('Error checking auth:', err)
          router.push('/login')
          return
        }
      } else {
        if (!user || user.role !== 'TALENT') {
          router.push('/login')
          return
        }
      }

      try {
        const [profileRes, skillsRes] = await Promise.all([
          fetch('/api/user/profile', { credentials: 'include' }),
          fetch('/api/skills', { credentials: 'include' })
        ])

        if (!mounted) return

        const profileData = await profileRes.json()
        const skillsData = await skillsRes.json()

        if (profileData.success && profileData.data) {
          const profile = profileData.data
          if (profile.status === 'SUBMITTED' || profile.status === 'APPROVED' || profile.status === 'PENDING') {
            router.push('/talent')
            return
          }
          if (profile.fullName || profile.country || profile.timezone || profile.headline) {
            const fullNameValue = (profile.fullName || '').trim()
            const nameParts = fullNameValue.split(/\s+/).filter(Boolean)
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            setFormData(prev => ({
              ...prev,
              firstName: firstName || prev.firstName,
              lastName: lastName || prev.lastName,
              jobTitle: profile.headline || profile.jobTitle || prev.jobTitle,
              country: profile.country || prev.country,
              timezone: profile.timezone || prev.timezone,
              bio: profile.bio || prev.bio,
              phone: profile.phone || prev.phone,
              location: profile.location || prev.location,
              hourlyRate: profile.hourlyRate ? String(profile.hourlyRate) : prev.hourlyRate,
              availability: profile.availability || prev.availability,
              linkedInUrl: profile.linkedInUrl || prev.linkedInUrl,
              githubUrl: profile.githubUrl || prev.githubUrl,
              skillIds: profile.skills?.map((s: any) => s.id) || prev.skillIds,
              experience: profile.experience || prev.experience,
              portfolioUrl: profile.portfolioUrl || prev.portfolioUrl,
              introVideoUrl: profile.introVideoUrl || prev.introVideoUrl,
            }))
          }
        }

        if (skillsData.success) {
          setSkills(skillsData.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        if (mounted) {
          clearTimeout(timeoutId)
          setPageLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
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

  const handleAddCustomSkill = async () => {
    if (!newSkillName.trim()) return

    const skillName = newSkillName.trim()
    
    // Check if skill already exists in custom skills
    if (formData.customSkills.includes(skillName)) {
      alert('This skill is already added')
      setNewSkillName('')
      return
    }

    // Check if skill exists in the skills list
    const existingSkill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase())
    if (existingSkill) {
      // Add existing skill instead
      if (!formData.skillIds.includes(existingSkill.id)) {
        setFormData({
          ...formData,
          skillIds: [...formData.skillIds, existingSkill.id],
        })
      }
      setNewSkillName('')
      return
    }

    // Add custom skill
    setAddingSkill(true)
    try {
      // Try to create skill in database
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: skillName }),
      })

      const data = await response.json()
      
      if (data.success && data.data) {
        // Skill created, add to skills list and select it
        const newSkill = { id: data.data.id, name: data.data.name }
        setSkills([...skills, newSkill].sort((a, b) => a.name.localeCompare(b.name)))
        setFormData({
          ...formData,
          skillIds: [...formData.skillIds, newSkill.id],
        })
      } else {
        // If creation fails, just add as custom skill
        setFormData({
          ...formData,
          customSkills: [...formData.customSkills, skillName],
        })
      }
    } catch (error) {
      // On error, add as custom skill
      setFormData({
        ...formData,
        customSkills: [...formData.customSkills, skillName],
      })
    } finally {
      setNewSkillName('')
      setAddingSkill(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // First, create custom skills in database
      const customSkillIds: string[] = []
      for (const customSkillName of formData.customSkills) {
        try {
          const response = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: customSkillName }),
          })
          const data = await response.json()
          if (data.success && data.data) {
            customSkillIds.push(data.data.id)
          }
        } catch (error) {
          console.error('Error creating custom skill:', error)
        }
      }

      // Combine existing skillIds with newly created custom skills
      const allSkillIds = [...formData.skillIds, ...customSkillIds]

      // Submit profile with all data
      const response = await fetch('/api/user/profile/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
          skillIds: allSkillIds,
          customSkills: undefined, // Don't send customSkills, we've converted them to skillIds
        }),
      })

      const data = await response.json()
      if (data.success) {
        console.log(' Profile submitted successfully')
        // Move to completion step
        setCurrentStep(5)
        // Note: User will manually click "Go to Dashboard" button
        // which will redirect to /talent and fetch fresh status
      } else {
        const errorMessage = data.error || data.message || 'Failed to submit profile'
        alert(errorMessage)
        console.error(' Profile submission error:', data)
      }
    } catch (error) {
      console.error('Error submitting profile:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = () => {
    // Force reload to get fresh status - use window.location.href for full page reload
    // This ensures we get the latest status from the database
    console.log('Redirecting to /talent with full page reload...')
    window.location.href = '/talent'
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-8 pb-8">
        <div className="max-w-6xl mx-auto px-6 space-y-4">
        {/* Progress Indicator */}
        {currentStep < 5 && (
          <div className="mb-4">
            <div className="mb-2 max-w-[720px] mx-auto">
              <div className="flex items-center justify-between">
              {STEPS.slice(0, 4).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center w-20">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all duration-200 ${
                        currentStep >= step.id
                          ? 'bg-brand-purple text-white shadow-lg ring-2 ring-brand-purple/20'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="mt-2 text-center w-full">
                      <p className="text-xs font-semibold text-gray-900">{step.title}</p>
                    </div>
                  </div>
                  {index < STEPS.slice(0, 4).length - 1 && (
                    <div
                      className={`h-1 w-10 rounded-full transition-all duration-300 ${
                        currentStep > step.id ? 'bg-brand-purple' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Step {currentStep} of {STEPS.length - 1}
              </p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card className="border-2 shadow-lg">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <>
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-t-lg py-6">
                <CardTitle className="text-2xl">Welcome to Monera Talent! </CardTitle>
                <CardDescription className="text-purple-100">
                  Complete your profile to start finding amazing opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-xl"></span>
                    Video Introduction Required
                  </h3>
                  <p className="text-blue-800 text-sm mb-2">
                    Please prepare a video introduction in <strong>English</strong> (2-5 minutes).
                  </p>
                  <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                    <li>Introduce yourself and your background</li>
                    <li>Explain your skills and expertise</li>
                    <li>Share why you're interested in Monera</li>
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { step: 1, title: 'Basic Info', icon: '' },
                    { step: 2, title: 'Skills', icon: '' },
                    { step: 3, title: 'Experience', icon: '' },
                  ].map((item) => (
                    <div key={item.step} className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    className="bg-brand-purple hover:bg-purple-700 text-white px-8 py-3 text-base font-semibold"
                    onClick={handleNext}
                  >
                    Get Started 
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <>
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Step 2: Basic Information</CardTitle>
                <CardDescription className="text-purple-100">Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="md:col-span-1">
                    <Label className="text-sm font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      placeholder="First name"
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label className="text-sm font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      placeholder="Last name"
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="jobTitle" className="text-sm font-semibold">Professional Job Title *</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      required
                      className="mt-2"
                      placeholder="e.g. Senior Frontend Developer, UI/UX Designer, Data Scientist"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your current or desired position</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio" className="text-sm font-semibold">Bio / About You *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={2}
                      className="mt-2"
                      placeholder="Tell us about yourself, your background, and what makes you unique..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000 characters</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="country" className="text-sm font-semibold">Country *</Label>
                        <Select
                          id="country"
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value })}
                          required
                          className="mt-2"
                        >
                          <option value="">Select your country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-sm font-semibold">City / Location *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="mt-2"
                          placeholder="e.g. Jakarta, New York, London"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone" className="text-sm font-semibold">Timezone *</Label>
                        <Select
                          id="timezone"
                          value={formData.timezone}
                          onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                          required
                          className="mt-2"
                        >
                          <option value="">Select your timezone</option>
                          {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-2"
                          placeholder="e.g. +62 812-3456-7890"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="linkedInUrl" className="text-sm font-semibold">LinkedIn URL</Label>
                    <Input
                      id="linkedInUrl"
                      type="url"
                      value={formData.linkedInUrl}
                      onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                      className="mt-2"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="githubUrl" className="text-sm font-semibold">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                      className="mt-2"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="hourlyRate" className="text-sm font-semibold">Hourly Rate (USD)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      className="mt-2"
                      placeholder="e.g. 50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Label htmlFor="availability" className="text-sm font-semibold">Availability</Label>
                    <Select
                      id="availability"
                      value={formData.availability || 'Open'}
                      onValueChange={(value) => setFormData({ ...formData, availability: value })}
                      className="mt-2"
                    >
                      <option value="Open">Open</option>
                      <option value="Busy">Busy</option>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between gap-4 mt-6 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} className="min-w-[100px]">
                     Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep2Complete}
                    className="bg-brand-purple hover:bg-purple-700 min-w-[100px]"
                  >
                    Next 
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Skills */}
          {currentStep === 3 && (
            <>
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Step 3: Skills & Expertise</CardTitle>
                <CardDescription className="text-purple-100">Select or add your skills</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-4 block text-sm font-semibold">Select Your Skills * (Select at least one)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto border p-4 rounded-md bg-gray-50">
                    {skills.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 py-8">Loading skills...</p>
                    ) : (
                      skills.map((skill) => (
                        <label key={skill.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded">
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
                            className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                          />
                          <span className="text-sm">{skill.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Custom Skill */}
                <div className="border-t pt-4">
                  <Label className="mb-2 block text-sm font-semibold">Add Your Own Skill</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. React Native, Figma, AWS"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomSkill()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomSkill}
                      disabled={!newSkillName.trim() || addingSkill}
                      className="bg-brand-purple hover:bg-purple-700"
                    >
                      {addingSkill ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>

                {/* Selected Skills Display */}
                {(formData.skillIds.length > 0 || formData.customSkills.length > 0) && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Selected Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skillIds.map((skillId) => {
                        const skill = skills.find(s => s.id === skillId)
                        return skill ? (
                          <span key={skillId} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {skill.name}
                          </span>
                        ) : null
                      })}
                      {formData.customSkills.map((skillName, index) => (
                        <span key={`custom-${index}`} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                          {skillName}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                customSkills: formData.customSkills.filter((_, i) => i !== index),
                              })
                            }}
                            className="text-green-700 hover:text-green-900"
                          >
                            
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Total: {formData.skillIds.length + formData.customSkills.length} skill{formData.skillIds.length + formData.customSkills.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <div className="flex justify-between gap-4 mt-6 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} className="min-w-[100px]">
                     Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={formData.skillIds.length === 0 && formData.customSkills.length === 0}
                    className="bg-brand-purple hover:bg-purple-700 min-w-[100px]"
                  >
                    Next 
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Experience */}
          {currentStep === 4 && (
            <>
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Step 4: Experience</CardTitle>
                <CardDescription className="text-purple-100">Share your background</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label htmlFor="experience" className="text-sm font-semibold">Professional Experience *</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={5}
                    required
                    className="mt-2"
                    placeholder="Tell us about your professional experience, projects, and achievements..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 50 characters</p>
                </div>
                <div>
                  <Label htmlFor="portfolioUrl" className="text-sm font-semibold">Portfolio URL (Optional)</Label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Video Introduction *</Label>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-3 mt-2">
                    <p className="text-sm text-blue-900 font-semibold mb-1"> Video Requirements:</p>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>Record in <strong>English</strong></li>
                      <li>2-5 minutes duration</li>
                      <li>Max file size: 100MB</li>
                    </ul>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 100 * 1024 * 1024) {
                          alert('File size must be less than 100MB')
                          return
                        }
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
                    <p className="text-sm text-green-600 mt-2 font-medium"> Video uploaded successfully</p>
                  )}
                </div>
                <div className="flex justify-between gap-4 mt-8 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleBack} className="min-w-[100px]">
                     Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !isStep4Complete}
                    className="bg-green-600 hover:bg-green-700 min-w-[150px]"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Submitting...
                      </>
                    ) : (
                      ' Submit Profile'
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <>
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <CardTitle className="text-2xl text-center"> Congratulations!</CardTitle>
                <CardDescription className="text-green-100 text-center">
                  Your profile has been submitted successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6 text-center">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">You're All Set!</h3>
                <p className="text-gray-600 mb-6">
                  Your profile is now under review. Our team will review it within 24 hours.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left">
                  <p className="text-blue-800 text-sm font-semibold mb-2">What's Next?</p>
                  <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                    <li>You can browse available jobs while waiting</li>
                    <li>We'll notify you once your profile is approved</li>
                    <li>Check your profile status anytime from your dashboard</li>
                  </ul>
                </div>
                <Button
                  size="lg"
                  className="bg-brand-purple hover:bg-purple-700 text-white px-8 py-3 text-base font-semibold"
                  onClick={handleComplete}
                >
                  Go to Dashboard 
                </Button>
              </CardContent>
            </>
          )}
        </Card>
        </div>
      </div>
    </>
  )
}


