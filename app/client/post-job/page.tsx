'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export const runtime = 'edge'

export default function ClientPostJobPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    scopeOfWork: '',
    location: '',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    engagementType: '',
    hoursPerWeek: '',
    duration: '',
    experienceLevel: '',
    projectType: '',
    companyId: '',
    skillIds: [] as string[],
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Layout already handles auth, so we can fetch directly
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [companiesRes, skillsRes] = await Promise.all([
        fetch('/api/companies', {
          credentials: 'include',
        }),
        fetch('/api/skills', {
          credentials: 'include',
        }),
      ])

      const companiesData = await companiesRes.json()
      const skillsData = await skillsRes.json()

      console.log('Companies response:', companiesData)
      console.log('Skills response:', skillsData)
      console.log('Skills response status:', skillsRes.status)
      console.log('Skills response ok:', skillsRes.ok)

      if (companiesData.success) {
        setCompanies(companiesData.data.companies || [])
      } else {
        console.warn('Companies fetch failed:', companiesData)
      }

      if (skillsData.success) {
        const skillsList = skillsData.data || []
        console.log('Raw skills data:', skillsList)
        console.log('Skills count:', skillsList.length)
        
        // Ensure skills have id and name
        const validSkills = skillsList
          .filter((skill: any) => skill && skill.id && skill.name)
          .map((skill: any) => ({
            id: skill.id,
            name: skill.name,
            category: skill.category || null,
          }))
        
        console.log('Valid skills after filtering:', validSkills)
        console.log('Valid skills count:', validSkills.length)
        
        setSkills(validSkills)
        
        if (validSkills.length === 0) {
          if (skillsList.length > 0) {
            console.warn('Skills data format issue. First skill:', skillsList[0])
            setMessage({ type: 'error', text: 'Skills data format is incorrect. Please contact support.' })
          } else {
            console.warn('No skills found in database')
            setMessage({ type: 'error', text: 'No skills available. Please add skills in the admin panel first.' })
          }
        }
      } else {
        console.error('Failed to fetch skills:', skillsData)
        console.error('Skills error details:', JSON.stringify(skillsData, null, 2))
        setMessage({ type: 'error', text: skillsData.error || 'Failed to load skills. Please refresh the page.' })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setMessage({ type: 'error', text: 'Failed to load data. Please refresh the page.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          engagementType: formData.engagementType || undefined,
          hoursPerWeek: formData.hoursPerWeek || undefined,
          duration: formData.duration || undefined,
          experienceLevel: formData.experienceLevel || undefined,
          projectType: formData.projectType || undefined,
          scopeOfWork: formData.scopeOfWork || undefined,
          skillIds: formData.skillIds.length > 0 ? formData.skillIds : undefined,
          companyId: formData.companyId || undefined,
        }),
      })

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
        console.error('API Error Response:', errorData)
        setMessage({ 
          type: 'error', 
          text: errorData.error || errorData.message || `Failed to post job (${response.status})` 
        })
        setSubmitting(false)
        return
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Job posted successfully!' })
        setTimeout(() => {
          router.push('/client/jobs')
        }, 2000)
      } else {
        console.error('API returned error:', data)
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ')
          setMessage({ type: 'error', text: `Validation error: ${errorMessages}` })
        } else {
          setMessage({ type: 'error', text: data.error || data.message || 'Failed to post job' })
        }
      }
    } catch (error) {
      console.error('Error submitting job:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please check your connection and try again.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-headline">Post a Job</h1>
        <p className="text-gray-600 mt-1">Create a new job posting to attract top talent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior React Developer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Required skills, experience, education..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeOfWork">Scope of Work (Optional)</Label>
              <Textarea
                id="scopeOfWork"
                rows={6}
                value={formData.scopeOfWork}
                onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                placeholder="List the specific tasks and deliverables (one per line):&#10;- Task 1&#10;- Task 2&#10;- Task 3"
              />
              <p className="text-xs text-gray-500">Enter each task or deliverable on a new line</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Work Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., New York, NY or Remote"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remote"
                checked={formData.remote}
                onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="remote">Remote work available</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Min Salary (per hour)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Max Salary (per hour)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="IDR">IDR (Rp)</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="engagementType">Engagement Type</Label>
              <Select
                id="engagementType"
                value={formData.engagementType}
                onChange={(e) => setFormData({ ...formData, engagementType: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="Hourly">Hourly</option>
                <option value="Fixed">Fixed</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Hours per week</Label>
                <Select
                  id="hoursPerWeek"
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Less than 30 hrs/week">Less than 30 hrs/week</option>
                  <option value="More than 30 hrs/week">More than 30 hrs/week</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Less than 1 month">Less than 1 month</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="Entry">Entry</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select
                  id="projectType"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="One-time project">One-time project</option>
                  <option value="Ongoing project">Ongoing project</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {companies.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="companyId">Company</Label>
                <Select
                  id="companyId"
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Required Skills</Label>
              {loading ? (
                <div className="text-sm text-gray-500 p-3">Loading skills...</div>
              ) : skills.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 border rounded-md">
                  No skills available. Please add skills in the admin panel first.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-3 rounded-md">
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
              )}
            </div>
          </CardContent>
        </Card>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex space-x-4">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? 'Posting...' : 'Post Job'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/client/jobs')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
