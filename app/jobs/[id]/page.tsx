'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/footer'

export const dynamic = 'force-dynamic'

interface Job {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  status?: string
  category?: string | null
  company: {
    id: string
    name: string
    description: string | null
    website: string | null
  } | null
  skills: Array<{ id: string; name: string }>
  recruiter: {
    email: string
    recruiterProfile: {
      firstName: string | null
      lastName: string | null
    } | null
  }
  createdAt: string
  _count?: {
    applications: number
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const jobId = Array.isArray(params.id) ? params.id[0] : params.id

    if (jobId) {
      fetchJob()
      if (user) checkIfSaved()
    } else {
      setLoading(false)
      setJob(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user])

  const fetchJob = async () => {
    const jobId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

    if (!jobId) {
      setLoading(false)
      setJob(null)
      return
    }

    try {
      const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        setJob(null)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setJob(data.data)
      } else {
        setJob(null)
      }
    } catch (error) {
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  const checkIfSaved = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/saved-jobs')
      const data = await response.json()
      if (data.success) {
        const jobId = Array.isArray(params.id) ? params.id[0] : params.id
        setIsSaved(data.data?.jobIds?.includes(jobId) || false)
      }
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const handleSave = async () => {
    if (!user) {
      router.push('/login?redirect=/jobs/' + params.id)
      return
    }

    setSaving(true)
    try {
      const jobId = Array.isArray(params.id) ? params.id[0] : params.id
      const method = isSaved ? 'DELETE' : 'POST'
      const url = isSaved ? `/api/saved-jobs?jobId=${jobId}` : '/api/saved-jobs'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ jobId }) : undefined,
      })

      const data = await response.json()
      if (data.success) {
        setIsSaved(!isSaved)
        // Trigger dashboard refresh if we're on dashboard
        if (window.location.pathname === '/talent') {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setSaving(false)
    }
  }
    if (!user) {
      router.push('/login?redirect=/jobs/' + params.id)
      return
    }

    if (user.role !== 'TALENT') {
      setMessage({ type: 'error', text: 'Only talent can apply for jobs' })
      return
    }

    setApplying(true)
    setMessage(null)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId: params.id,
          coverLetter: coverLetter || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Application submitted successfully!' })
        setShowApplyForm(false)
        setCoverLetter('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f4fb] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-slate-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    const jobId = Array.isArray(params.id) ? params.id[0] : (params.id as string)
    return (
      <div className="min-h-screen bg-[#f6f4fb]">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-4">??</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Job not found</h1>
            <p className="text-slate-600 mb-6">
              The job you're looking for doesn't exist or may have been removed.
            </p>
            {process.env.NODE_ENV === 'development' && jobId && (
              <p className="text-sm text-slate-500 mb-8">Job ID: {jobId}</p>
            )}
            <div className="space-y-3">
              <Button onClick={() => router.push('/jobs')} className="bg-brand-purple hover:bg-purple-700">
                Browse All Jobs
              </Button>
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLoading(true)
                    fetchJob()
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const recruiterName = job.recruiter?.recruiterProfile
    ? `${job.recruiter.recruiterProfile.firstName || ''} ${job.recruiter.recruiterProfile.lastName || ''}`.trim()
    : '';

  return (
    <div className="min-h-screen bg-[#f6f4fb]">
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/jobs" className="hover:text-brand-purple">Jobs</Link> / {job.title}
        </div>

        <Card className="border border-purple-100 bg-white shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-brand-purple">Job ID: {job.id}</p>
                <h1 className="mt-2 text-3xl font-semibold text-gray-900">{job.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  {job.company?.name && <span>{job.company.name}</span>}
                  {job.location && !job.remote && <span>Location: {job.location}</span>}
                  {job.remote && <span className="text-brand-purple">Remote</span>}
                  {job.category && <span className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">{job.category}</span>}
                </div>
              </div>
              <div className="text-left md:text-right">
                {job.salaryMin && (
                  <p className="text-2xl font-semibold text-brand-purple">
                    {job.currency || '$'}{job.salaryMin.toLocaleString()}
                    {job.salaryMax ? ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}` : ''}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-400">
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Job Description</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">Overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap text-gray-600 leading-relaxed">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {job.requirements && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide text-gray-400">Essentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none whitespace-pre-wrap text-gray-600 leading-relaxed">
                    {job.requirements}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Skills Required</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">Must-have</CardDescription>
              </CardHeader>
              <CardContent>
                {job.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill.id} className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No specific skills listed.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Apply for this Job</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">Ready to apply</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Login to apply for this job</p>
                    <Button
                      className="w-full rounded-full bg-brand-purple hover:bg-purple-700"
                      onClick={() => router.push('/login?redirect=/jobs/' + params.id)}
                    >
                      Log In to Apply
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => router.push('/register?role=TALENT')}
                    >
                      Create Account
                    </Button>
                  </div>
                ) : user.role !== 'TALENT' ? (
                  <div className="text-sm text-gray-500">
                    Only talent can apply for jobs.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!showApplyForm ? (
                      <div className="space-y-3">
                        <Button
                          className="w-full rounded-full bg-brand-purple hover:bg-purple-700"
                          onClick={() => setShowApplyForm(true)}
                        >
                          Apply Now
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full rounded-full"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : (isSaved ? '❤️ Saved' : '🤍 Save Job')}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                          <Textarea
                            id="coverLetter"
                            rows={6}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Tell us why you're a great fit for this role..."
                          />
                        </div>
                        {message && (
                          <div
                            className={`rounded-md border p-3 text-sm ${
                              message.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                          >
                            {message.text}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 rounded-full bg-brand-purple hover:bg-purple-700"
                            onClick={handleApply}
                            disabled={applying}
                          >
                            {applying ? 'Submitting...' : 'Submit Application'}
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                              setShowApplyForm(false)
                              setCoverLetter('')
                              setMessage(null)
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {job.company && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">About the Company</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide text-gray-400">Employer</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-gray-900">{job.company.name}</p>
                  {job.company.description && (
                    <p className="mt-2 text-sm text-gray-600">{job.company.description}</p>
                  )}
                  {job.company.website && (
                    <Link
                      href={job.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-purple hover:underline"
                    >
                      Visit Website
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Job Information</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-gray-400">Details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Posted</span>
                  <span className="font-medium text-gray-900">
                    {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {(job as any)._count?.applications !== undefined && (
                  <div className="flex items-center justify-between">
                    <span>Applications</span>
                    <span className="font-medium text-gray-900">{(job as any)._count.applications}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {job.status || 'DRAFT'}
                  </span>
                </div>
                {recruiterName && (
                  <div className="flex items-center justify-between">
                    <span>Recruiter</span>
                    <span className="font-medium text-gray-900">{recruiterName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  )
}

