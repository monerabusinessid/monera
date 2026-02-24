'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
export const runtime = 'edge'

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
  skills: Array<{ id: string; name: string }>
  createdAt: string
}

export default function UserJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs?status=PUBLISHED', {
        credentials: 'include',
      })
      const data = await response.json()
      console.log('Jobs API response:', data)
      if (data.success) {
        const jobsList = data.data?.jobs || data.data || []
        console.log('Setting jobs:', jobsList.length, 'jobs')
        setJobs(jobsList)
      } else {
        console.error('Failed to fetch jobs:', data.error || data.message)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600 mt-1">Find your next opportunity</p>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No jobs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {job.company?.name || 'Company not specified'}
                      {job.location && ` • ${job.location}`}
                      {job.remote && ' • Remote'}
                    </CardDescription>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="text-right">
                      <p className="font-semibold text-purple-600">
                        {job.salaryMin && job.salaryMax
                          ? `${job.salaryMin} - ${job.salaryMax} ${job.currency || 'USD'}`
                          : job.salaryMin
                          ? `${job.salaryMin}+ ${job.currency || 'USD'}`
                          : `Up to ${job.salaryMax} ${job.currency || 'USD'}`}
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
                <Link href={`/user/jobs/${job.id}`}>
                  <Button>View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
