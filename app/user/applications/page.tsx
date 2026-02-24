'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
export const runtime = 'edge'

interface Application {
  id: string
  status: string
  coverLetter: string | null
  expectedRate: number | null
  createdAt: string
  job: {
    id: string
    title: string
    company: {
      name: string
    } | null
  }
}

export default function UserApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications?candidateId=me', {
        credentials: 'include',
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
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">Track your job applications</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
            <Link href="/user/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{application.job.title}</CardTitle>
                    <CardDescription>
                      {application.job.company?.name || 'Company not specified'}
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
                {application.coverLetter && (
                  <p className="text-gray-700 mb-4 line-clamp-3">{application.coverLetter}</p>
                )}
                {application.expectedRate && (
                  <p className="text-sm text-gray-600 mb-4">
                    Expected Rate: ${application.expectedRate}/hour
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Applied: {new Date(application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                </p>
                <Link href={`/user/jobs/${application.job.id}`}>
                  <Button variant="outline" className="mt-4">
                    View Job
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
