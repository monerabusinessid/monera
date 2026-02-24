'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Footer } from '@/components/footer'
export const runtime = 'edge'

export const dynamic = 'force-dynamic'

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
  const [isSaved, setIsSaved] = useState(false)
  const [savingJob, setSavingJob] = useState(false)

  const fetchProfileStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include', cache: 'no-store' })
      const data = await res.json()
      if (data?.success && data?.data) {
        setProfileStatus(data.data.status || null)
      }
    } catch (e) {
      console.warn('[JobDetail] Failed to fetch profile status:', e)
    }
  }, [])

  const fetchJob = useCallback(async () => {
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
  }, [jobId])

  const checkApplication = useCallback(async () => {
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
  }, [jobId])

  const fetchSavedState = useCallback(async () => {
    try {
      const response = await fetch(`/api/saved-jobs?jobId=${jobId}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await response.json()
      if (data.success) {
        setIsSaved(Boolean(data.data?.saved))
      }
    } catch (error) {
      console.error('Failed to fetch saved state:', error)
    }
  }, [jobId])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT' && jobId) {
      fetchJob()
      checkApplication()
      fetchProfileStatus()
      fetchSavedState()
    }
  }, [user, loading, router, jobId, fetchJob, checkApplication, fetchProfileStatus, fetchSavedState])

  const handleToggleSave = async () => {
    if (savingJob) return
    setSavingJob(true)
    try {
      if (isSaved) {
        const response = await fetch(`/api/saved-jobs?jobId=${jobId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        const data = await response.json()
        if (data.success) {
          setIsSaved(false)
        }
      } else {
        const response = await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ jobId }),
        })
        const data = await response.json()
        if (data.success) {
          setIsSaved(true)
        }
      }
    } catch (error) {
      console.error('Failed to toggle saved job:', error)
    } finally {
      setSavingJob(false)
    }
  }

  const handleReport = () => {
    if (!job) return
    const subject = encodeURIComponent(`Report Job: ${job.title}`)
    const body = encodeURIComponent(
      `Job ID: ${job.id}\nJob Title: ${job.title}\nJob Link: ${typeof window !== 'undefined' ? window.location.href : ''}\n\nPlease describe the issue:`
    )
    window.location.href = `mailto:monerabusiness.id@gmail.com?subject=${subject}&body=${body}`
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
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">Job not found</p>
              <Link href="/talent/jobs">
                <Button className="rounded-full">Back to Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/talent/jobs">
            <Button variant="outline" size="sm" className="rounded-full">Back to Jobs</Button>
          </Link>
          <span className="text-xs text-gray-400">Posted {formatTimeAgo(job.createdAt)}</span>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-semibold text-gray-900">{job.title}</h1>
                    <p className="text-sm text-gray-500 mt-2">
                      {job.company?.name || job.recruiter?.name || job.recruiter?.email || 'Company'} - {job.location || 'Worldwide'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.remote && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">Remote</span>}
                    {job.engagementType && (
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">{job.engagementType}</span>
                    )}
                    {job.experienceLevel && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{job.experienceLevel}</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>

            {job.scopeOfWork && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Scope of Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-600">
                  {job.scopeOfWork.split('\n').filter(line => line.trim()).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-purple"></span>
                      <p className="leading-relaxed">{item.trim()}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {(job.engagementType || job.hoursPerWeek || job.duration || job.experienceLevel || job.projectType) && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  {job.engagementType && (
                    <div>
                      <p className="text-xs uppercase text-gray-400">Engagement</p>
                      <p className="font-medium text-gray-900">{job.engagementType}</p>
                    </div>
                  )}
                  {job.hoursPerWeek && (
                    <div>
                      <p className="text-xs uppercase text-gray-400">Hours / Week</p>
                      <p className="font-medium text-gray-900">{job.hoursPerWeek}</p>
                    </div>
                  )}
                  {job.duration && (
                    <div>
                      <p className="text-xs uppercase text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900">{job.duration}</p>
                    </div>
                  )}
                  {job.projectType && (
                    <div>
                      <p className="text-xs uppercase text-gray-400">Project Type</p>
                      <p className="font-medium text-gray-900">{job.projectType}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {job.skills.length > 0 && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Skills Required</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill.id} className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
                      {skill.name}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

            {job.requirements && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 whitespace-pre-wrap">
                  {job.requirements}
                </CardContent>
              </Card>
            )}

            {job._count && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Activity</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-6 text-sm text-gray-600">
                  <div>
                    <span className="text-xs uppercase text-gray-400">Applications</span>
                    <p className="text-lg font-semibold text-gray-900">{job._count.applications || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-gray-400">Last viewed</span>
                    <p className="text-lg font-semibold text-gray-900">{formatTimeAgo(job.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {profileStatus && profileStatus !== 'APPROVED' ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Your profile is still under review. You can apply once it is approved.
                  </div>
                </CardContent>
              </Card>
            ) : hasApplied ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    You already applied to this job.
                  </div>
                  <Link href="/talent/applications">
                    <Button variant="outline" className="mt-4 rounded-full">View Applications</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : showApplyForm ? (
              <Card className="border border-gray-100 shadow-sm">
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

                    {formData.expectedRate && job.salaryMin && (
                      <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Your Expected Rate</span>
                          <span className="font-semibold text-gray-900">${parseFloat(formData.expectedRate || '0').toFixed(2)}/hour</span>
                        </div>
                        {job.salaryMin && (
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-gray-600">Job Budget</span>
                            <span className="font-semibold text-gray-900">
                              ${job.salaryMin.toLocaleString()}
                              {job.salaryMax && ` - $${job.salaryMax.toLocaleString()}`}
                            </span>
                          </div>
                        )}
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
                        className="flex-1 rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-brand-purple hover:bg-purple-700 rounded-full"
                      >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <Card className="border border-gray-100 shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-6">
                {!hasApplied && profileStatus === 'APPROVED' && !showApplyForm && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full bg-brand-purple hover:bg-purple-700 rounded-full"
                      size="lg"
                    >
                      Apply now
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant={isSaved ? 'default' : 'outline'}
                    className={`flex-1 rounded-full ${isSaved ? 'bg-brand-purple hover:bg-purple-700 text-white' : ''}`}
                    size="sm"
                    onClick={handleToggleSave}
                    disabled={savingJob}
                  >
                    {savingJob ? 'Saving...' : (isSaved ? 'Saved' : 'Save job')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    size="sm"
                    onClick={handleReport}
                  >
                    Report
                  </Button>
                </div>

                {job.salaryMin && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Budget</h4>
                    <p className="text-2xl font-semibold text-brand-purple mt-2">
                      {job.currency || '$'}{job.salaryMin.toLocaleString()}
                      {job.salaryMax && ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-gray-400">per hour</p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">About the client</h4>
                  <p className="text-xs text-gray-500">Location: {job.location || 'Worldwide'}</p>
                  {job.company && (
                    <p className="text-xs text-gray-500">Company: {job.company.name}</p>
                  )}
                </div>

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

