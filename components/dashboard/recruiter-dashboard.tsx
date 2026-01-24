'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    id: string
    firstName: string | null
    lastName: string | null
    user: {
      email: string
    }
  }
  job: {
    id: string
    title: string
  }
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs?recruiterId=me&limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/applications?limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const jobsData = await jobsRes.json()
      const appsData = await appsRes.json()

      if (jobsData.success) {
        setJobs(jobsData.data.jobs || [])
      }
      if (appsData.success) {
        setApplications(appsData.data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
        <p className="text-gray-600">Manage your jobs and applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Jobs</h2>
        <Link href="/post-job">
          <Button>Post a Job</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
            <Link href="/post-job">
              <Button>Post Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 mb-12">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>
                      <Link href={`/jobs/${job.id}`} className="hover:text-brand-purple">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>Status: {job.status}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{job._count.applications}</div>
                    <div className="text-sm text-gray-500">Applications</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/jobs/${job.id}/applications`}>
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Recent Applications</h2>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No applications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.slice(0, 5).map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>
                      {application.candidate.firstName || ''}{' '}
                      {application.candidate.lastName || ''}
                    </CardTitle>
                    <CardDescription>
                      Applied for {application.job.title}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {application.candidate.user.email}
                  </span>
                  <Link href={`/applications/${application.id}`}>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
