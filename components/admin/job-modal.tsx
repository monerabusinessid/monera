'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createJob, updateJob, deleteJob } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  title: string
  description: string
  requirements?: string | null
  location: string | null
  remote: boolean
  salaryMin?: number | null
  salary_min?: number | null
  salaryMax?: number | null
  salary_max?: number | null
  currency: string | null
  status: string
  recruiterId?: string
  recruiter_id?: string
  companyId?: string | null
  company_id?: string | null
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  publishedAt?: string | null
  published_at?: string | null
}

interface JobModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit' | 'view'
}

interface Skill {
  id: string
  name: string
}

export function JobModal({ job, isOpen, onClose, mode }: JobModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    status: 'PUBLISHED',
    recruiterId: '',
    companyId: '',
    category: 'Development & IT',
  })

  // Fetch skills on mount
  useEffect(() => {
    if (isOpen) {
      fetchSkills()
    }
  }, [isOpen])

  // Fetch job skills when editing
  useEffect(() => {
    if (isOpen && job && mode === 'edit') {
      fetchJobSkills()
    } else if (mode === 'create') {
      setSelectedSkillIds([])
    }
  }, [isOpen, job, mode])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      if (data.success) {
        setSkills(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    }
  }

  const fetchJobSkills = async () => {
    if (!job) return
    try {
      const response = await fetch(`/api/jobs/${job.id}`)
      const data = await response.json()
      if (data.success && data.data.skills) {
        setSelectedSkillIds(data.data.skills.map((s: Skill) => s.id))
      }
    } catch (error) {
      console.error('Failed to fetch job skills:', error)
    }
  }

  useEffect(() => {
    if (job) {
      // Support both camelCase and snake_case from database
      const salaryMin = job.salaryMin || job.salary_min
      const salaryMax = job.salaryMax || job.salary_max
      const recruiterId = job.recruiterId || job.recruiter_id
      const companyId = job.companyId || job.company_id
      
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        location: job.location || '',
        remote: job.remote || false,
        salaryMin: salaryMin?.toString() || '',
        salaryMax: salaryMax?.toString() || '',
        currency: job.currency || 'USD',
        status: job.status || 'PUBLISHED',
        recruiterId: recruiterId || '',
        companyId: companyId || '',
        category: (job as any).category || 'Development & IT',
      })
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        remote: false,
        salaryMin: '',
        salaryMax: '',
        currency: 'USD',
        status: 'PUBLISHED',
        recruiterId: '',
        companyId: '',
        category: 'Development & IT',
      })
    }
  }, [job, mode])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const formDataObj = new FormData()

    if (mode === 'create') {
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      if (formData.requirements) formDataObj.append('requirements', formData.requirements)
      if (formData.location) formDataObj.append('location', formData.location)
      formDataObj.append('remote', formData.remote.toString())
      if (formData.salaryMin) formDataObj.append('salaryMin', formData.salaryMin)
      if (formData.salaryMax) formDataObj.append('salaryMax', formData.salaryMax)
      if (formData.currency) formDataObj.append('currency', formData.currency)
      if (formData.category) formDataObj.append('category', formData.category)
      // recruiterId and companyId are optional - will use admin user ID as default
      if (formData.recruiterId) formDataObj.append('recruiterId', formData.recruiterId)
      if (formData.companyId) formDataObj.append('companyId', formData.companyId)
      // Add skills
      if (selectedSkillIds.length > 0) {
        formDataObj.append('skillIds', selectedSkillIds.join(','))
      }

      const result = await createJob(formDataObj)
      setLoading(false)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        alert(result.error || 'Failed to create job')
      }
    } else if (job) {
      formDataObj.append('jobId', job.id)
      if (formData.title) formDataObj.append('title', formData.title)
      if (formData.description) formDataObj.append('description', formData.description)
      if (formData.requirements) formDataObj.append('requirements', formData.requirements)
      formDataObj.append('location', formData.location)
      formDataObj.append('remote', formData.remote.toString())
      if (formData.salaryMin) formDataObj.append('salaryMin', formData.salaryMin)
      if (formData.salaryMax) formDataObj.append('salaryMax', formData.salaryMax)
      formDataObj.append('currency', formData.currency)
      if (formData.status) formDataObj.append('status', formData.status)
      // Add skills (empty array will clear all skills)
      formDataObj.append('skillIds', selectedSkillIds.join(','))

      const result = await updateJob(formDataObj)
      setLoading(false)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        alert(result.error || 'Failed to update job')
      }
    }
  }

  const handleDelete = async () => {
    if (!job) return
    if (!confirm(`Are you sure you want to delete job "${job.title}"? This action cannot be undone.`)) return

    setLoading(true)
    const formDataObj = new FormData()
    formDataObj.append('jobId', job.id)

    const result = await deleteJob(formDataObj)
    setLoading(false)

    if (result.success) {
      router.refresh()
      onClose()
    } else {
      alert(result.error || 'Failed to delete job')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Job' : mode === 'edit' ? 'Edit Job' : 'View Job'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={mode === 'view'}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={mode === 'view'}
              required
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              disabled={mode === 'view'}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={mode === 'view'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Development & IT">Development & IT</option>
              <option value="Design & Creative">Design & Creative</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
              <option value="Admin & Customer Support">Admin & Customer Support</option>
              <option value="Engineering & Architecture">Engineering & Architecture</option>
              <option value="Legal">Legal</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Writing & Translation">Writing & Translation</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="USD">USD</option>
                <option value="IDR">IDR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin">Salary Min</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label htmlFor="salaryMax">Salary Max</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                disabled={mode === 'view'}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={formData.remote}
              onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
              disabled={mode === 'view'}
              className="w-4 h-4"
            />
            <Label htmlFor="remote">Remote Work</Label>
          </div>

          <div>
            <Label htmlFor="skills">Required Skills</Label>
            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500">Loading skills...</p>
              ) : (
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <label key={skill.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSkillIds.includes(skill.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkillIds([...selectedSkillIds, skill.id])
                          } else {
                            setSelectedSkillIds(selectedSkillIds.filter(id => id !== skill.id))
                          }
                        }}
                        disabled={mode === 'view'}
                        className="w-4 h-4 text-brand-purple"
                      />
                      <span className="text-sm">{skill.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedSkillIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{selectedSkillIds.length} skill(s) selected</p>
            )}
          </div>

          {mode !== 'create' && (
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Job' : 'Save Changes')}
              </Button>
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          )}

          {mode === 'view' && (
            <div className="pt-4">
              <Button type="button" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
