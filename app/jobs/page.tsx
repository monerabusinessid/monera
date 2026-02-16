'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { JobSearchFilters, JobFilters } from '@/components/jobs/job-search-filters'
import { JobCard } from '@/components/jobs/job-card'
import { Button } from '@/components/ui/button'

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<JobFilters>({})
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)

  const fetchJobs = async (newFilters: JobFilters = filters, pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (newFilters.query) params.append('query', newFilters.query)
      if (newFilters.location) params.append('location', newFilters.location)
      if (newFilters.remote !== undefined) params.append('remote', newFilters.remote.toString())
      if (newFilters.salaryMin) params.append('salaryMin', newFilters.salaryMin.toString())
      if (newFilters.salaryMax) params.append('salaryMax', newFilters.salaryMax.toString())
      if (newFilters.company) params.append('company', newFilters.company)
      if (newFilters.skills?.length) {
        newFilters.skills.forEach(skill => params.append('skills', skill))
      }
      params.append('page', pageNum.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        const newJobs = data.data || []
        setJobs(append ? [...jobs, ...newJobs] : newJobs)
        setTotalJobs(data.total || 0)
        setHasMore(newJobs.length === 12) // If we got less than limit, no more pages
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppliedJobs = async () => {
    if (!user || user.role !== 'TALENT') return

    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      
      if (data.success) {
        const appliedJobIds = new Set(data.data.map((app: any) => app.jobId))
        setAppliedJobs(appliedJobIds)
      }
    } catch (error) {
      console.error('Error fetching applied jobs:', error)
    }
  }

  useEffect(() => {
    fetchJobs()
    fetchAppliedJobs()
  }, [])

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters)
    setPage(1)
    fetchJobs(newFilters, 1, false)
  }

  const handleApply = async (jobId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    if (user.role !== 'TALENT') {
      alert('Only talent can apply to jobs')
      return
    }

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (data.success) {
        setAppliedJobs(prev => new Set([...prev, jobId]))
        alert('Application submitted successfully!')
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      alert('Failed to submit application')
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchJobs(filters, nextPage, true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
          <p className="text-gray-600">
            Discover {totalJobs} quality job opportunities from vetted companies
          </p>
        </div>

        <JobSearchFilters 
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />

        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
              <p className="mt-4 text-gray-600">Loading jobs...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search filters to find more opportunities.</p>
            <Button 
              onClick={() => handleFiltersChange({})}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  isApplied={appliedJobs.has(job.id)}
                  showApplyButton={user?.role === 'TALENT'}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Load More Jobs'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}