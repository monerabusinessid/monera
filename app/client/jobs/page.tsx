'use client'

import { useEffect, useState, useCallback } from 'react'
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
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  status: string
  created_at: string
  published_at: string | null
  company: {
    name: string
  } | null
  applicationCount?: number
}

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [lastFetch, setLastFetch] = useState(Date.now())

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs?recruiterId=me', {
        credentials: 'include',
      })
      const data = await response.json()
      
      console.log('Client jobs API response:', data)
      
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
      setLastFetch(Date.now())
    }
  }, [])

  useEffect(() => {
    fetchJobs()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchJobs()
    }, 30000)

    // Refresh when window regains focus
    const handleFocus = () => {
      fetchJobs()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchJobs])

  const refreshData = useCallback(() => {
    setLoading(true)
    fetchJobs()
  }, [fetchJobs])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700'
      case 'CLOSED':
        return 'bg-red-100 text-red-700'
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: jobs.length,
    published: jobs.filter((j) => j.status === 'PUBLISHED').length,
    draft: jobs.filter((j) => j.status === 'DRAFT').length,
    closed: jobs.filter((j) => j.status === 'CLOSED').length,
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-headline">My Jobs</h1>
          <p className="text-gray-600 mt-1">Manage and track your job postings</p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetch > 0 && (
            <span className="text-xs text-gray-500 hidden md:block">
              Last updated: {new Date(lastFetch).toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Link href="/client/post-job">
            <Button className="bg-brand-purple hover:bg-purple-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-purple">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search jobs by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-brand-purple' : ''}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PUBLISHED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PUBLISHED')}
                className={statusFilter === 'PUBLISHED' ? 'bg-brand-purple' : ''}
              >
                Published
              </Button>
              <Button
                variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('DRAFT')}
                className={statusFilter === 'DRAFT' ? 'bg-brand-purple' : ''}
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'CLOSED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('CLOSED')}
                className={statusFilter === 'CLOSED' ? 'bg-brand-purple' : ''}
              >
                Closed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-500">
                {jobs.length === 0
                  ? "You haven't posted any jobs yet. Get started by posting your first job!"
                  : 'No jobs match your search criteria.'}
              </p>
              {jobs.length === 0 && (
                <Link href="/client/post-job" className="mt-4 inline-block">
                  <Button className="bg-brand-purple hover:bg-purple-700">Post Your First Job</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-brand-purple">
                          {job.title}
                        </h3>
                      </Link>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {job.company && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {job.company.name}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      {job.remote && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Remote
                        </span>
                      )}
                      {job.salary_min && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {job.currency || '$'}
                          {job.salary_min.toLocaleString()}
                          {job.salary_max && ` - ${job.currency || '$'}${job.salary_max.toLocaleString()}`}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Posted {formatDate(job.created_at)}
                      </span>
                    </div>
                    {job.applicationCount !== undefined && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">
                          <strong>{job.applicationCount}</strong> application{job.applicationCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
                          try {
                            const response = await fetch(`/api/jobs/${job.id}`, {
                              method: 'DELETE',
                              credentials: 'include',
                            })
                            const data = await response.json()
                            if (data.success) {
                              fetchJobs() // Refresh the list
                            } else {
                              alert(data.error || 'Failed to delete job')
                            }
                          } catch (error) {
                            console.error('Failed to delete job:', error)
                            alert('Failed to delete job')
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
