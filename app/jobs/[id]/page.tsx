'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    // Get job ID from params - handle both string and array
    const jobId = Array.isArray(params.id) ? params.id[0] : params.id
    
    console.log('JobDetailPage: Component mounted/updated')
    console.log('JobDetailPage: params:', params)
    console.log('JobDetailPage: jobId:', jobId, 'Type:', typeof jobId)
    
    if (jobId) {
      fetchJob()
    } else {
      console.error('JobDetailPage: No job ID provided in params')
      setLoading(false)
      setJob(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchJob = async () => {
    // Get job ID from params - handle both string and array
    const jobId = Array.isArray(params.id) ? params.id[0] : (params.id as string)
    
    console.log('JobDetailPage: fetchJob called with jobId:', jobId, 'Type:', typeof jobId)
    
    if (!jobId) {
      console.error('JobDetailPage: No job ID provided')
      setLoading(false)
      setJob(null)
      return
    }

    try {
      const url = `/api/jobs/${encodeURIComponent(jobId)}`
      console.log('JobDetailPage: Fetching from URL:', url)
      
      const response = await fetch(url, {
        credentials: 'include',
      })
      
      console.log('JobDetailPage: Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('JobDetailPage: Response not OK:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('JobDetailPage: Error response body:', errorText)
        setJob(null)
        setLoading(false)
        return
      }
      
      const data = await response.json()
      console.log('JobDetailPage: Response data:', data)
      
      if (data.success) {
        console.log('JobDetailPage: Job fetched successfully:', data.data)
        setJob(data.data)
      } else {
        console.error('JobDetailPage: Failed to fetch job:', data.error, data)
        setJob(null)
      }
    } catch (error) {
      console.error('JobDetailPage: Error fetching job:', error)
      if (error instanceof Error) {
        console.error('JobDetailPage: Error message:', error.message)
        console.error('JobDetailPage: Error stack:', error.stack)
      }
      setJob(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Job not found</h1>
            <p className="text-slate-600 mb-4">
              The job you're looking for doesn't exist or may have been removed.
            </p>
            {process.env.NODE_ENV === 'development' && jobId && (
              <p className="text-sm text-slate-500 mb-8">
                Job ID: {jobId}
              </p>
            )}
            <div className="space-y-3">
              <Button onClick={() => router.push('/jobs')} className="bg-brand-purple hover:bg-purple-700">
                Browse All Jobs
              </Button>
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Retrying fetch for job ID:', jobId)
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 pt-16 pb-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24 shadow-sm border border-slate-200 rounded-3xl bg-white">
            <CardHeader className="bg-gradient-to-br from-brand-purple to-purple-700 text-white rounded-t-3xl">
              <CardTitle className="text-xl">Apply for this Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!user ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Login to apply for this job
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-brand-purple hover:bg-purple-700" 
                      onClick={() => router.push('/login?redirect=/jobs/' + params.id)}
                    >
                      Log In to Apply
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-brand-purple text-brand-purple hover:bg-purple-50" 
                      onClick={() => router.push('/register?role=TALENT')}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              ) : user.role !== 'TALENT' ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-600 mb-4">
                    Only talent can apply for jobs
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/register?role=TALENT')}
                  >
                    Become Talent
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!showApplyForm ? (
                    <Button 
                      className="w-full bg-brand-yellow hover:bg-yellow-400 text-gray-900 font-semibold shadow-md" 
                      size="lg"
                      onClick={() => setShowApplyForm(true)}
                    >
                      Apply Now
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter" className="font-semibold">Cover Letter (Optional)</Label>
                        <Textarea
                          id="coverLetter"
                          rows={6}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Tell us why you're a great fit for this role..."
                          className="border-2 focus:border-brand-purple"
                        />
                      </div>
                      {message && (
                        <div
                          className={`p-3 rounded-md text-sm ${
                            message.type === 'success'
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {message.text}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1 bg-brand-purple hover:bg-purple-700"
                          onClick={handleApply}
                          disabled={applying}
                        >
                          {applying ? 'Submitting...' : 'Submit Application'}
                        </Button>
                        <Button
                          variant="outline"
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
            <Card className="shadow-sm border border-slate-200 rounded-3xl bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-900">About the Company</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-slate-500">Employer</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="font-semibold text-lg mb-3 text-slate-900">{job.company.name}</p>
                {job.company.description && (
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">{job.company.description}</p>
                )}
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-purple text-sm font-medium hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Stats */}
          <Card className="shadow-sm border border-slate-200 rounded-3xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">Job Information</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wide text-slate-500">Status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Posted</span>
                <span className="text-sm font-medium">
                  {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {(job as any)._count?.applications !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Applications</span>
                  <span className="text-sm font-medium">{(job as any)._count.applications}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Status</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {job.status || 'DRAFT'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-4">
                    {job.company?.name && (
                      <span className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {job.company.name}
                      </span>
                    )}
                    {job.location && !job.remote && (
                      <span className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {job.remote && (
                      <span className="flex items-center gap-1 text-brand-purple font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Remote
                      </span>
                    )}
                    {(job as any).category && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {(job as any).category}
                      </span>
                    )}
                  </div>
                  {job.salaryMin && (
                    <div className="text-2xl md:text-3xl font-semibold text-brand-purple mb-2">
                      {job.currency || '$'}{job.salaryMin.toLocaleString()}
                      {job.salaryMax && ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`}
                    </div>
                  )}
                  <div className="text-sm text-slate-500">
                    Posted {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200 rounded-3xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">Job Description</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wide text-slate-500">Overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">{job.description}</div>
            </CardContent>
          </Card>

          {job.requirements && (
            <Card className="shadow-sm border border-slate-200 rounded-3xl bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg text-slate-900">Requirements</CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide text-slate-500">Essentials</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">{job.requirements}</div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border border-slate-200 rounded-3xl bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-900">Skills Required</CardTitle>
              <CardDescription className="text-xs uppercase tracking-wide text-slate-500">Must-have</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {job.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200 hover:shadow-sm transition-shadow"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No specific skills listed</p>
              )}
            </CardContent>
          </Card>
        </div>

        </div>
      </div>
    </div>
  )
}
