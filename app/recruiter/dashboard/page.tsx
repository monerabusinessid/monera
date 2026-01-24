'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

interface Job {
  id: string
  title: string
  status: string
  createdAt: string
  _count: {
    applications: number
  }
}

interface Application {
  id: string
  status: string
  createdAt: string
  candidate: {
    firstName: string | null
    lastName: string | null
    headline: string | null
    isProfileReady: boolean
  }
  job: {
    title: string
  }
}

export default function RecruiterDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [newApplications, setNewApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const allowedRoles = ['RECRUITER', 'SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN']
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/login')
      return
    }
    if (user && allowedRoles.includes(user.role)) {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs?recruiterId=me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/applications?recruiterId=me&limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const jobsData = await jobsRes.json()
      const appsData = await appsRes.json()

      if (jobsData.success) {
        const jobs = jobsData.data.jobs || []
        setActiveJobs(jobs.filter((j: Job) => j.status === 'PUBLISHED').slice(0, 5))
        setStats((prev) => ({
          ...prev,
          totalJobs: jobs.length,
          activeJobs: jobs.filter((j: Job) => j.status === 'PUBLISHED').length,
        }))
      }

      if (appsData.success) {
        const apps = appsData.data.applications || []
        setNewApplications(apps.slice(0, 5))
        setStats((prev) => ({
          ...prev,
          totalApplications: apps.length,
          newApplications: apps.filter((a: Application) => a.status === 'PENDING').length,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const allowedRoles = ['RECRUITER', 'SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN']
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">{stats.totalJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.activeJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">New Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.newApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/recruiter/jobs/create">
                  <Button className="bg-brand-purple hover:bg-purple-700">Post New Job</Button>
                </Link>
                <Link href="/recruiter/talent-search">
                  <Button variant="outline">Search Talent</Button>
                </Link>
                <Link href="/recruiter/applicants">
                  <Button variant="outline">View All Applicants</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Jobs</CardTitle>
                <Link href="/recruiter/jobs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {activeJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No active jobs yet</p>
                  <Link href="/recruiter/jobs/create">
                    <Button className="mt-4">Post Your First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/recruiter/jobs/${job.id}`}>
                            <h3 className="font-semibold hover:text-brand-purple">{job.title}</h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {job._count.applications} application{job._count.applications !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Posted {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Link href="/recruiter/applicants">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {newApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newApplications.map((app) => (
                    <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {app.candidate.firstName} {app.candidate.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{app.candidate.headline}</p>
                          <p className="text-xs text-gray-500 mt-1">Applied to: {app.job.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {app.candidate.isProfileReady ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                              Ready ✓
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                              Not Ready
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs ${
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            app.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
