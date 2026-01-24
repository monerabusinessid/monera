'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Job {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  remote: boolean
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  status: string
  company: {
    id: string
    name: string
  } | null
  skills: Array<{ id: string; name: string }>
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    companyId: '',
    skillIds: [] as string[],
    status: 'DRAFT',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [jobRes, companiesRes, skillsRes] = await Promise.all([
        fetch(`/api/jobs/${params.id}`, {
          credentials: 'include',
        }),
        fetch('/api/companies', {
          credentials: 'include',
        }),
        fetch('/api/skills', {
          credentials: 'include',
        }),
      ])

      const jobData = await jobRes.json()
      const companiesData = await companiesRes.json()
      const skillsData = await skillsRes.json()

      if (jobData.success && jobData.data) {
        const job = jobData.data
        setJob(job)
        setFormData({
          title: job.title || '',
          description: job.description || '',
          requirements: job.requirements || '',
          location: job.location || '',
          remote: job.remote || false,
          salaryMin: job.salary_min?.toString() || '',
          salaryMax: job.salary_max?.toString() || '',
          currency: job.currency || 'USD',
          companyId: job.company?.id || '',
          skillIds: job.skills?.map((s: any) => s.id) || [],
          status: job.status || 'DRAFT',
        })

        // Check if user owns this job
        if (user && user.role !== 'ADMIN') {
          // Verify ownership through API or check recruiter_id
          // For now, we'll let the API handle authorization
        }
      } else {
        setMessage({ type: 'error', text: 'Job not found' })
      }

      if (companiesData.success) {
        setCompanies(companiesData.data.companies || [])
      }
      if (skillsData.success) {
        const skillsList = skillsData.data || []
        console.log('Setting skills:', skillsList)
        setSkills(skillsList)
      } else {
        console.error('Failed to fetch skills:', skillsData)
        setMessage({ type: 'error', text: 'Failed to load skills. Please refresh the page.' })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setMessage({ type: 'error', text: 'Failed to load job data' })
    } finally {
      setLoading(false)
    }
  }, [params.id, user])

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/jobs/' + params.id + '/edit')
      return
    }
    if (user.role !== 'CLIENT' && user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
      router.push('/jobs/' + params.id)
      return
    }
    fetchData()
  }, [user, router, params.id, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          skillIds: formData.skillIds.length > 0 ? formData.skillIds : undefined,
          companyId: formData.companyId || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Job updated successfully!' })
        setTimeout(() => {
          if (user?.role === 'CLIENT') {
            router.push('/client/jobs')
          } else {
            router.push(`/jobs/${params.id}`)
          }
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update job' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Edit Job</h1>

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
                <Label htmlFor="salaryMin">Min Salary</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Max Salary</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="100000"
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
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
            {submitting ? 'Updating...' : 'Update Job'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
