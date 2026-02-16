'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

interface Application {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    company: { name: string } | null
    location: string | null
    remote: boolean
  }
}

export default function InterviewsPage() {
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
      fetchInterviews()
    }
  }, [user, loading, router])

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/applications?status=INTERVIEW', {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setApplications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error)
    } finally {
      setLoadingData(false)
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

  return (
    <>
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-900">Interviews</h1>
            <p className="text-sm text-gray-500 mt-1">{applications.length} interviews scheduled</p>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-4">No interviews scheduled yet</p>
                <Link href="/talent/jobs">
                  <Button className="bg-brand-purple hover:bg-purple-700">Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            Interview
                          </span>
                          <span className="text-xs text-gray-500">
                            Applied {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Link href={`/talent/jobs/${app.job.id}`}>
                          <h3 className="text-xl font-semibold text-brand-purple hover:underline mb-2">
                            {app.job.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-3">
                          {app.job.company?.name || 'Company'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {app.job.remote && <span className="bg-gray-100 px-3 py-1 rounded-full">Remote</span>}
                          {app.job.location && <span className="bg-gray-100 px-3 py-1 rounded-full">{app.job.location}</span>}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/talent/applications/${app.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
