'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { JobCard } from '@/components/jobs/job-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardStats {
  profileCompletion: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  savedJobs: number
}

export function TalentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    profileCompletion: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    savedJobs: 0
  })
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [
        applicationsRes,
        jobsRes,
        savedJobsRes
      ] = await Promise.all([
        fetch('/api/applications', { credentials: 'include' }),
        fetch('/api/jobs?status=PUBLISHED&limit=6', { credentials: 'include' }),
        fetch('/api/saved-jobs', { credentials: 'include' })
      ])

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        if (applicationsData.success) {
          const applications = applicationsData.data || []
          setRecentApplications(applications.slice(0, 5))
          setAppliedJobs(new Set(applications.map((app: any) => app.jobId)))
          
          setStats(prev => ({
            ...prev,
            totalApplications: applications.length,
            pendingApplications: applications.filter((app: any) => app.status === 'PENDING').length,
            acceptedApplications: applications.filter((app: any) => app.status === 'ACCEPTED').length,
            rejectedApplications: applications.filter((app: any) => app.status === 'REJECTED').length
          }))
        }
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        if (jobsData.success) {
          setRecommendedJobs(jobsData.jobs || [])
        }
      }

      if (savedJobsRes.ok) {
        const savedData = await savedJobsRes.json()
        if (savedData.success && savedData.data) {
          setSavedJobs(new Set(savedData.data.jobIds || []))
          setStats(prev => ({
            ...prev,
            savedJobs: savedData.data.count || 0
          }))
        }
      }

      setStats(prev => ({ ...prev, profileCompletion: 75 }))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (jobId: string) => {
    try {
      const isSaved = savedJobs.has(jobId)
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
        if (isSaved) {
          setSavedJobs(prev => {
            const newSet = new Set(prev)
            newSet.delete(jobId)
            return newSet
          })
          setStats(prev => ({ ...prev, savedJobs: prev.savedJobs - 1 }))
        } else {
          setSavedJobs(prev => new Set([...prev, jobId]))
          setStats(prev => ({ ...prev, savedJobs: prev.savedJobs + 1 }))
        }
        setTimeout(() => fetchDashboardData(), 500)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    }
  }

  const handleApply = async (jobId: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (data.success) {
        setAppliedJobs(prev => new Set([...prev, jobId]))
        setStats(prev => ({
          ...prev,
          totalApplications: prev.totalApplications + 1,
          pendingApplications: prev.pendingApplications + 1
        }))
        alert('Application submitted successfully!')
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Failed to submit application')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'ACCEPTED':
        return 'text-green-600 bg-green-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      case 'REVIEWING':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your job search
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.profileCompletion}%</p>
                </div>
                <div className="w-12 h-12 bg-brand-purple/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              {stats.profileCompletion < 100 && (
                <div className="mt-4">
                  <Link href="/talent/profile">
                    <Button size="sm" variant="outline" className="w-full">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.savedJobs}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recommended Jobs</CardTitle>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recommendedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                    <p className="text-gray-600 mb-4">
                      Complete your profile to get personalized job recommendations
                    </p>
                    <Link href="/talent/profile">
                      <Button>Complete Profile</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onApply={handleApply}
                        isApplied={appliedJobs.has(job.id)}
                        onSave={handleSave}
                        isSaved={savedJobs.has(job.id)}
                        showApplyButton={true}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>
                  <Link href="/talent/applications">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start applying to jobs to see your applications here
                    </p>
                    <Link href="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {application.job?.title || 'Job Title'}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {application.job?.company?.name || 'Company Name'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
