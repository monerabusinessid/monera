'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

interface ReadinessResult {
  isReady: boolean
  completion: number
  missingFields: string[]
  scores: {
    headline: number
    skills: number
    experience: number
    rate: number
    portfolio: number
    availability: number
    name: number
  }
}

interface Application {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    company: {
      name: string
    } | null
  }
}

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [readinessRes, appsRes] = await Promise.all([
        fetch('/api/candidate/profile/check', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/applications?candidateId=me&limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const readinessData = await readinessRes.json()
      const appsData = await appsRes.json()

      if (readinessData.success) {
        setReadiness(readinessData.data)
      }

      if (appsData.success) {
        setApplications(appsData.data.applications || [])
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

  if (!user || user.role !== 'TALENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>

        {/* Profile Completion Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-brand-purple">{readiness?.completion || 0}%</span>
                {readiness?.isReady && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Profile Ready ✓
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-brand-purple h-3 rounded-full transition-all"
                  style={{ width: `${readiness?.completion || 0}%` }}
                ></div>
              </div>
            </div>

            {readiness && !readiness.isReady && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Missing fields:</p>
                <ul className="space-y-1">
                  {readiness.missingFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6">
              {readiness?.isReady ? (
                <Link href="/candidate/jobs/best-match">
                  <Button className="w-full bg-brand-purple hover:bg-purple-700">
                    View Best Match Jobs
                  </Button>
                </Link>
              ) : (
                <Link href="/candidate/profile">
                  <Button className="w-full bg-brand-purple hover:bg-purple-700">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/candidate/applications">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applications yet</p>
                {readiness?.isReady ? (
                  <Link href="/candidate/jobs/best-match">
                    <Button className="mt-4">Browse Jobs</Button>
                  </Link>
                ) : (
                  <Link href="/candidate/profile">
                    <Button className="mt-4">Complete Profile First</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/jobs/${app.job.id}`} className="hover:text-brand-purple">
                          <h3 className="font-semibold">{app.job.title}</h3>
                        </Link>
                        <p className="text-sm text-gray-600">
                          {app.job.company?.name || 'No company'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                        </p>
                      </div>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
