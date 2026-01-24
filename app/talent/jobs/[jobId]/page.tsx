'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Footer } from '@/components/footer'

interface Job {
  id: string
  title: string
  description: string
  requirements: string | null
  scopeOfWork: string | null
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  engagementType: string | null
  hoursPerWeek: string | null
  duration: string | null
  experienceLevel: string | null
  projectType: string | null
  company: {
    name: string
    website: string | null
  } | null
  recruiter: {
    email: string
    name: string | null
  }
  skills: Array<{ id: string; name: string }>
  createdAt: string
  _count?: {
    applications: number
  }
}

export default function JobDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string
  const [job, setJob] = useState<Job | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedRate: '',
    availability: '',
    startDate: '',
    portfolioUrl: '',
    resumeUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    additionalInfo: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [profileStatus, setProfileStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT' && jobId) {
      fetchJob()
      checkApplication()
      fetchProfileStatus()
    }
  }, [user, loading, router, jobId])

  const fetchProfileStatus = async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include', cache: 'no-store' })
      const data = await res.json()
      if (data?.success && data?.data) {
        setProfileStatus(data.data.status || null)
      }
    } catch (e) {
      console.warn('[JobDetail] Failed to fetch profile status:', e)
    }
  }

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      const data = await response.json()

      if (data.success) {
        setJob(data.data)
      } else {
        setMessage({ type: 'error', text: 'Job not found' })
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
      setMessage({ type: 'error', text: 'Failed to load job details' })
    } finally {
      setLoadingData(false)
    }
  }

  const checkApplication = async () => {
    try {
      const response = await fetch(`/api/applications?jobId=${jobId}&candidateId=me`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success && data.data.applications.length > 0) {
        setHasApplied(true)
      }
    } catch (error) {
      console.error('Failed to check application:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} hours ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId,
          coverLetter: formData.coverLetter,
          expectedRate: formData.expectedRate ? parseFloat(formData.expectedRate) : undefined,
          availability: formData.availability || undefined,
          startDate: formData.startDate || undefined,
          portfolioUrl: formData.portfolioUrl || undefined,
          resumeUrl: formData.resumeUrl || undefined,
          linkedInUrl: formData.linkedInUrl || undefined,
          githubUrl: formData.githubUrl || undefined,
          additionalInfo: formData.additionalInfo || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Application submitted successfully!' })
        setHasApplied(true)
        setShowApplyForm(false)
        setFormData({ 
          coverLetter: '', 
          expectedRate: '', 
          availability: '', 
          startDate: '', 
          portfolioUrl: '', 
          resumeUrl: '', 
          linkedInUrl: '', 
          githubUrl: '', 
          additionalInfo: '' 
        })
        setTimeout(() => {
          router.push('/talent/applications')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Job not found</p>
            <Link href="/talent/jobs">
              <Button>Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/talent/jobs">
            <Button variant="outline" size="sm">← Back to Jobs</Button>
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-3">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>Posted {formatTimeAgo(job.createdAt)}</span>
                      <span>•</span>
                      <span>{job.location || 'Worldwide'}</span>
                      {job.remote && <span className="text-brand-purple">🌍 Remote</span>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary / Project Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Summary / Project Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>

                {/* Scope of Work */}
                {job.scopeOfWork && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Scope of Work</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {job.scopeOfWork.split('\n').filter(line => line.trim()).map((item, index) => (
                        <li key={index} className="leading-relaxed">{item.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Engagement Details */}
                {(job.engagementType || job.hoursPerWeek || job.duration || job.experienceLevel || job.projectType) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Engagement Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {job.engagementType && (
                        <div>
                          <span className="font-medium text-gray-600">Engagement:</span>
                          <span className="ml-2 text-gray-900">{job.engagementType}</span>
                        </div>
                      )}
                      {job.hoursPerWeek && (
                        <div>
                          <span className="font-medium text-gray-600">Hours:</span>
                          <span className="ml-2 text-gray-900">{job.hoursPerWeek}</span>
                        </div>
                      )}
                      {job.duration && (
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span>
                          <span className="ml-2 text-gray-900">{job.duration}</span>
                        </div>
                      )}
                      {job.experienceLevel && (
                        <div>
                          <span className="font-medium text-gray-600">Experience Level:</span>
                          <span className="ml-2 text-gray-900">{job.experienceLevel}</span>
                        </div>
                      )}
                      {job.projectType && (
                        <div>
                          <span className="font-medium text-gray-600">Project Type:</span>
                          <span className="ml-2 text-gray-900">{job.projectType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills and Expertise */}
                {job.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Skills and Expertise (Mandatory skills)</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                  </div>
                )}

                {/* Activity on this job */}
                {job._count && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Activity on this job</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Proposals:</span>
                        <span className="ml-2 font-medium text-gray-900">{job._count.applications || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last viewed:</span>
                        <span className="ml-2 font-medium text-gray-900">{formatTimeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Form */}
            {profileStatus && profileStatus !== 'APPROVED' ? (
              <Card>
                <CardContent className="p-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900 font-medium">You can't apply while your profile is under review.</p>
                    <p className="text-blue-800 text-sm mt-1">Once your profile is approved, you'll be able to apply to jobs.</p>
                  </div>
                </CardContent>
              </Card>
            ) : hasApplied ? (
              <Card>
                <CardContent className="p-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">You have already applied to this job</p>
                    <Link href="/talent/applications">
                      <Button variant="outline" className="mt-2">View My Applications</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : showApplyForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="coverLetter">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                        placeholder="Tell the recruiter why you're a good fit for this position..."
                        rows={6}
                        maxLength={2000}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.coverLetter.length}/2000 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expectedRate">Expected Hourly Rate (USD) *</Label>
                        <Input
                          id="expectedRate"
                          type="number"
                          value={formData.expectedRate}
                          onChange={(e) => setFormData({ ...formData, expectedRate: e.target.value })}
                          placeholder="50"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="availability">Availability</Label>
                        <Select
                          id="availability"
                          value={formData.availability}
                          onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        >
                          <option value="">Select...</option>
                          <option value="Full-time">Full-time (40+ hrs/week)</option>
                          <option value="Part-time">Part-time (20-40 hrs/week)</option>
                          <option value="Less than 20 hrs/week">Less than 20 hrs/week</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="startDate">Expected Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div>
                        <Label htmlFor="resumeUrl">Resume/CV URL</Label>
                        <Input
                          id="resumeUrl"
                          type="url"
                          value={formData.resumeUrl}
                          onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                          placeholder="https://yourresume.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedInUrl">LinkedIn Profile</Label>
                        <Input
                          id="linkedInUrl"
                          type="url"
                          value={formData.linkedInUrl}
                          onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="githubUrl">GitHub Profile</Label>
                        <Input
                          id="githubUrl"
                          type="url"
                          value={formData.githubUrl}
                          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        placeholder="Any additional information you'd like to share..."
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.additionalInfo.length}/1000 characters
                      </p>
                    </div>

                    {/* Cost Breakdown */}
                    {formData.expectedRate && job.salaryMin && (
                      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-3">Cost Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Your Expected Rate:</span>
                            <span className="font-medium">${parseFloat(formData.expectedRate || '0').toFixed(2)}/hour</span>
                          </div>
                          {formData.availability && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Availability:</span>
                              <span className="font-medium">{formData.availability}</span>
                            </div>
                          )}
                          {job.salaryMin && (
                            <div className="border-t border-purple-200 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Job Budget Range:</span>
                                <span className="font-medium">
                                  ${job.salaryMin.toLocaleString()}
                                  {job.salaryMax && ` - $${job.salaryMax.toLocaleString()}`}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowApplyForm(false)
                          setFormData({ 
                            coverLetter: '', 
                            expectedRate: '', 
                            availability: '', 
                            startDate: '', 
                            portfolioUrl: '', 
                            resumeUrl: '', 
                            linkedInUrl: '', 
                            githubUrl: '', 
                            additionalInfo: '' 
                          })
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-brand-purple hover:bg-purple-700"
                      >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                {/* Actions */}
                {!hasApplied && profileStatus === 'APPROVED' && !showApplyForm && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full bg-brand-purple hover:bg-purple-700"
                      size="lg"
                    >
                      Apply now
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" size="sm">
                        Save job
                      </Button>
                      <Button variant="outline" className="flex-1" size="sm">
                        Flag as inappropriate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Budget */}
                {job.salaryMin && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Budget</h4>
                    <p className="text-2xl font-bold text-brand-purple">
                      {job.currency || '$'}{job.salaryMin.toLocaleString()}
                      {job.salaryMax && ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">per hour</p>
                  </div>
                )}

                {/* About the client */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">About the client</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-600">Payment method verified</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{job.location || 'Worldwide'}</span>
                    </div>
                    {job.company && (
                      <div>
                        <span className="text-gray-600">Company:</span>
                        <span className="ml-2 font-medium">{job.company.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job link */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500 mb-2">Job link</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href)
                          alert('Link copied to clipboard!')
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
