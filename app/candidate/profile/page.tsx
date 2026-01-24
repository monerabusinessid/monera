'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Footer } from '@/components/footer'

interface Skill {
  id: string
  name: string
}

interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  headline: string | null
  bio: string | null
  location: string | null
  phone: string | null
  hourlyRate: number | null
  availability: string | null
  portfolioUrl: string | null
  linkedInUrl: string | null
  githubUrl: string | null
  skills: Skill[]
  profileCompletion: number | null
  isProfileReady: boolean
}

export default function CandidateProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    location: '',
    phone: '',
    hourlyRate: '',
    availability: 'Open',
    portfolioUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    skillIds: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [readiness, setReadiness] = useState<any>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CANDIDATE')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'CANDIDATE') {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [profileRes, skillsRes, readinessRes] = await Promise.all([
        fetch('/api/profile/candidate', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/skills'),
        fetch('/api/candidate/profile/check', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const profileData = await profileRes.json()
      const skillsData = await skillsRes.json()
      const readinessData = await readinessRes.json()

      if (profileData.success && profileData.data) {
        const p = profileData.data
        setProfile(p)
        setFormData({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          headline: p.headline || '',
          bio: p.bio || '',
          location: p.location || '',
          phone: p.phone || '',
          hourlyRate: p.hourlyRate?.toString() || '',
          availability: p.availability || 'Open',
          portfolioUrl: p.portfolioUrl || '',
          linkedInUrl: p.linkedInUrl || '',
          githubUrl: p.githubUrl || '',
          skillIds: p.skills?.map((s: Skill) => s.id) || [],
        })
      }

      if (skillsData.success) {
        setAllSkills(skillsData.data || [])
      }

      if (readinessData.success) {
        setReadiness(readinessData.data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setMessage(null)
  }

  const handleSkillToggle = (skillId: string) => {
    if (!formData.skillIds.includes(skillId)) {
      setFormData((prev) => ({
        ...prev,
        skillIds: [...prev.skillIds, skillId],
      }))
      setSkillSearch('')
    }
  }

  const removeSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.filter((id) => id !== skillId),
    }))
  }

  const filteredSkills = allSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !formData.skillIds.includes(skill.id)
  )

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/candidate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
          skillIds: formData.skillIds.length > 0 ? formData.skillIds : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully! Recalculating readiness...' })
        
        // Recalculate readiness
        const readinessRes = await fetch('/api/candidate/profile/check', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const readinessData = await readinessRes.json()
        if (readinessData.success) {
          setReadiness(readinessData.data)
          setProfile(data.data)
        }
        
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'CANDIDATE') {
    return null
  }

  const headlineWords = formData.headline.split(/\s+/).filter(Boolean).length
  const bioChars = formData.bio.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Profile</h1>
          <p className="text-gray-600">Complete your profile to unlock best match jobs</p>
        </div>

        {/* Readiness Status */}
        {readiness && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Profile Readiness: {readiness.completion}%</h3>
                  <p className="text-sm text-gray-600">
                    {readiness.isReady 
                      ? 'Your profile is ready! You can now apply to best match jobs.'
                      : `Complete ${readiness.missingFields.length} more field(s) to unlock best match jobs.`
                    }
                  </p>
                </div>
                {readiness.isReady && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Ready ✓
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-purple h-2 rounded-full transition-all"
                  style={{ width: `${readiness.completion}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headline">Headline * (min 5 words)</Label>
              <Input
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="Senior Frontend Developer"
                maxLength={100}
                required
              />
              <p className="text-xs mt-1">
                <span className={headlineWords >= 5 ? 'text-green-600' : 'text-red-600'}>
                  {headlineWords}/5 words
                </span>
                {' '}/ 100 characters
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Experience / Bio * (min 100 characters)</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your experience..."
                rows={5}
                maxLength={1000}
                required
              />
              <p className="text-xs mt-1">
                <span className={bioChars >= 100 ? 'text-green-600' : 'text-red-600'}>
                  {bioChars}/100 characters
                </span>
                {' '}/ 1000 max
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={(e) => handleChange(e as any)}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Busy">Busy</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills * (min 3)</Label>
              {formData.skillIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skillIds.map((skillId) => {
                    const skill = allSkills.find(s => s.id === skillId)
                    return skill ? (
                      <span
                        key={skillId}
                        className="px-3 py-1 bg-brand-purple text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => removeSkill(skillId)}
                          className="hover:bg-purple-700 rounded-full p-0.5"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ) : null
                  })}
                </div>
              )}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search and add skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="pr-10"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {skillSearch && filteredSkills.length > 0 && (
                <div className="border rounded-lg p-2 mt-2 max-h-48 overflow-y-auto">
                  {filteredSkills.slice(0, 10).map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs mt-2">
                <span className={formData.skillIds.length >= 3 ? 'text-green-600' : 'text-red-600'}>
                  {formData.skillIds.length}/3 skills minimum
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Portfolio & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL *</Label>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  value={formData.linkedInUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-brand-purple hover:bg-purple-700">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
