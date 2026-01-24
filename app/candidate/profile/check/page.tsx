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

export default function ProfileCheckPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CANDIDATE')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'CANDIDATE') {
      fetchReadiness()
    }
  }, [user, loading, router])

  const fetchReadiness = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/candidate/profile/check', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setReadiness(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch readiness:', error)
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

  if (!user || user.role !== 'CANDIDATE') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Readiness Check</h1>
          <p className="text-gray-600">Review your profile completion status</p>
        </div>

        {readiness && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Overall Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-purple">{readiness.completion}%</h3>
                    <p className="text-sm text-gray-600">Profile Completion</p>
                  </div>
                  {readiness.isReady ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                      Profile Ready ✓
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                      Not Ready
                    </span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-brand-purple h-3 rounded-full transition-all"
                    style={{ width: `${readiness.completion}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {readiness.isReady
                    ? 'Your profile is ready! You can now access best match jobs.'
                    : `You need ${80 - readiness.completion}% more to unlock best match jobs.`
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Headline (15%)</span>
                    <span className="font-semibold">{readiness.scores.headline}/15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Skills (20%)</span>
                    <span className="font-semibold">{readiness.scores.skills}/20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Experience/Bio (20%)</span>
                    <span className="font-semibold">{readiness.scores.experience}/20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hourly Rate (15%)</span>
                    <span className="font-semibold">{readiness.scores.rate}/15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Portfolio (10%)</span>
                    <span className="font-semibold">{readiness.scores.portfolio}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Availability (10%)</span>
                    <span className="font-semibold">{readiness.scores.availability}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Full Name (10%)</span>
                    <span className="font-semibold">{readiness.scores.name}/10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {readiness.missingFields.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Missing Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {readiness.missingFields.map((field, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {field}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Link href="/candidate/profile">
                <Button className="bg-brand-purple hover:bg-purple-700">
                  Edit Profile
                </Button>
              </Link>
              {readiness.isReady && (
                <Link href="/candidate/jobs/best-match">
                  <Button variant="outline">
                    View Best Match Jobs
                  </Button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
