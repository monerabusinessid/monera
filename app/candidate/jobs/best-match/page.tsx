'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

interface Job {
  id: string
  title: string
  description: string
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  company: {
    name: string
  } | null
  recruiter: {
    email: string
  }
  skills: Array<{ id: string; name: string }>
  matchScore: number
  skillMatchScore: number
  rateMatchScore: number
  hasApplied: boolean
  createdAt: string
}

export default function BestMatchJobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [profileReady, setProfileReady] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)

  const checkProfileAndFetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Check profile readiness first
      const readinessRes = await fetch('/api/candidate/profile/check', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const readinessData = await readinessRes.json()

      if (readinessData.success) {
        if (!readinessData.data.isReady) {
          // Redirect to profile if not ready
          router.push('/candidate/profile')
          return
        }
        setProfileReady(true)

        // Fetch best match jobs
        const jobsRes = await fetch('/api/candidate/jobs/best-match', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const jobsData = await jobsRes.json()

        if (jobsData.success) {
          setJobs(jobsData.data.jobs || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoadingData(false)
    }
  }, [router])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      checkProfileAndFetchJobs()
    }
  }, [user, loading, router, checkProfileAndFetchJobs])

  const handleApply = async (jobId: string) => {
    if (applying) return

    setApplying(jobId)
    try {
      const token = localStorage.getItem('token')
      
      // Check availability first
      const profileRes = await fetch('/api/profile/candidate', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const profileData = await profileRes.json()

      if (profileData.success && profileData.data.availability === 'Busy') {
        alert('You cannot apply while your availability is set to Busy. Please update your profile.')
        setApplying(null)
        return
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          coverLetter: 'I am interested in this position and believe my skills align well with your requirements.',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update jobs to mark as applied
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, hasApplied: true } : job
        ))
        alert('Application submitted successfully!')
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setApplying(null)
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

  if (!profileReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Profile Not Ready</h2>
            <p className="text-gray-600 mb-6">
              Complete your profile to unlock best match jobs.
            </p>
            <Link href="/candidate/profile">
              <Button className="bg-brand-purple hover:bg-purple-700">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Best Match Jobs</h1>
          <p className="text-gray-600">Jobs matched to your profile and skills</p>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">No best match jobs found</p>
              <Link href="/candidate/jobs/all">
                <Button variant="outline">Browse All Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">{job.title}</CardTitle>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {Math.round(job.matchScore)}% Match
                        </span>
                      </div>
                      <CardDescription>
                        {job.company?.name || 'No company'} • {job.recruiter.email}
                        {job.location && ` • ${job.location}`}
                        {job.remote && ' • 🌍 Remote'}
                      </CardDescription>
                    </div>
                    {job.salaryMin && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-brand-purple">
                          {job.currency || '$'}{job.salaryMin.toLocaleString()}
                          {job.salaryMax && ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-2 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {job.skills.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{job.skills.length - 6} more
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Match breakdown: Skills {Math.round(job.skillMatchScore)}% • Rate {Math.round(job.rateMatchScore)}%
                    </div>
                    {job.hasApplied ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                        Applied ✓
                      </span>
                    ) : (
                      <Button
                        onClick={() => handleApply(job.id)}
                        disabled={applying === job.id}
                        className="bg-brand-purple hover:bg-purple-700"
                      >
                        {applying === job.id ? 'Applying...' : 'Apply Now'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
