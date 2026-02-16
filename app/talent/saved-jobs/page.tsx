'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
  company: { name: string } | null
  recruiter: { email: string }
  skills: Array<{ id: string; name: string }>
  createdAt: string
}

export default function SavedJobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchSavedJobs()
    }
  }, [user, loading, router])

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('/api/saved-jobs?includeJobs=1', {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setJobs(data.data.jobs || [])
        setSavedJobIds(new Set(data.data.jobIds || []))
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await fetch(`/api/saved-jobs?jobId=${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      setJobs(jobs.filter(j => j.id !== jobId))
      setSavedJobIds(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    } catch (error) {
      console.error('Error unsaving job:', error)
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
            <h1 className="text-3xl font-semibold text-gray-900">Saved Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">{jobs.length} jobs saved</p>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-600 mb-4">No saved jobs yet</p>
                <Link href="/talent/jobs">
                  <Button className="bg-brand-purple hover:bg-purple-700">Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/talent/jobs/${job.id}`}>
                          <h3 className="text-xl font-semibold text-brand-purple hover:underline mb-2">
                            {job.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-3">
                          {job.company?.name || job.recruiter?.email}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3 text-xs">
                          {job.remote && <span className="bg-gray-100 px-3 py-1 rounded-full">Remote</span>}
                          {job.location && <span className="bg-gray-100 px-3 py-1 rounded-full">{job.location}</span>}
                          {job.salaryMin && (
                            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                              {job.currency || '$'}{job.salaryMin.toLocaleString()}
                              {job.salaryMax ? ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                        {job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.skills.slice(0, 5).map((skill) => (
                              <span key={skill.id} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                                {skill.name}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                                +{job.skills.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsaveJob(job.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Remove
                        </Button>
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
