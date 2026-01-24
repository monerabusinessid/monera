'use client'

import { useEffect, useState } from 'react'
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
  createdAt: string
}

export default function AllJobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'CANDIDATE')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'CANDIDATE') {
      fetchJobs()
    }
  }, [user, loading, router])

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/jobs?status=PUBLISHED&limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (data.success) {
        setJobs(data.data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Jobs</h1>
          <p className="text-gray-600">Browse all available jobs</p>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No jobs available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
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
                    <p className="text-gray-600 line-clamp-2 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
