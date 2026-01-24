'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PostJobPage() {
  const { user } = useAuth()
  const router = useRouter()
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
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    // Allow CLIENT, RECRUITER, and ADMIN roles
    if (user.role !== 'CLIENT' && user.role !== 'RECRUITER' && user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchInitialData()
  }, [user, router])

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

      if (companiesData.success) {
        setCompanies(companiesData.data.companies || [])
      }
      if (skillsData.success) {
        setSkills(skillsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
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
          skillIds: formData.skillIds.length > 0 ? formData.skillIds : undefined,
          companyId: formData.companyId || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Job posted successfully!' })
        setTimeout(() => {
          // Redirect to client jobs page if user is CLIENT, otherwise to job detail
          if (user?.role === 'CLIENT') {
            router.push('/client/jobs')
          } else {
            router.push(`/jobs/${data.data.id}`)
          }
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to post job' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Post a Job</h1>

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
            </div>
          </CardContent>
        </Card>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-purple-50 text-purple-800'
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
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
