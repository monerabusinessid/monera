'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

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
    recruiter: {
      email: string
    }
  }
}

export default function TalentApplicationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchApplications()
    }
  }, [user, loading, router])

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
      setLoadingData(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700'
      case 'REJECTED':
        return 'bg-red-50 text-red-700'
      case 'SHORTLISTED':
        return 'bg-blue-50 text-blue-700'
      case 'REVIEWING':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500">Track your job applications and responses.</p>
        </div>

        {applications.length === 0 ? (
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-10 text-center">
              <div className="text-4xl mb-4"></div>
              <p className="text-gray-600 mb-4 text-lg">No applications yet</p>
              <Link href="/talent/jobs">
                <Button className="bg-brand-purple hover:bg-purple-700 rounded-full px-6">
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/talent/jobs/${app.job.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-purple">
                          {app.job.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {app.job.company?.name || app.job.recruiter.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Expected rate: {app.expectedRate ? `$${app.expectedRate}/hr` : 'N/A'}
                    </span>
                    <Link href={`/talent/jobs/${app.job.id}`}>
                      <Button variant="outline" size="sm" className="rounded-full px-4 border-brand-purple text-brand-purple">
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
      <Footer />
    </div>
  )
}

