'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Application {
  id: string
  status: string
  coverLetter: string | null
  createdAt: string
  job: {
    id: string
    title: string
    company: {
      name: string
    } | null
  }
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/applications?candidateId=me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setApplications(data.data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'SHORTLISTED':
        return 'bg-purple-100 text-purple-800'
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
        <p className="text-gray-600">Manage your applications and profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {applications.filter((a) => a.status === 'SHORTLISTED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Applications</h2>
        <div className="space-x-2">
          <Link href="/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading applications...</div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
            <Link href="/jobs">
              <Button>Browse Available Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>
                      <Link
                        href={`/jobs/${application.job.id}`}
                        className="hover:text-brand-purple"
                      >
                        {application.job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {application.job.company?.name || 'Company'}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {application.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/jobs/${application.job.id}`}>
                    <Button variant="outline" size="sm">
                      View Job
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
