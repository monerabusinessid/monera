'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { JobSearchFilters, JobFilters } from '@/components/jobs/job-search-filters'
import { JobCard } from '@/components/jobs/job-card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export default function JobsPage() {
  const { user } = useAuth()
  const { showToast, ToastComponent } = useToast()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<JobFilters>({})
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<any | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [applyTouchStart, setApplyTouchStart] = useState(0)
  const [applyTouchEnd, setApplyTouchEnd] = useState(0)

  const fetchJobs = async (newFilters: JobFilters = filters, pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (newFilters.query) params.append('query', newFilters.query)
      if (newFilters.location) params.append('location', newFilters.location)
      if (newFilters.remote !== undefined) params.append('remote', newFilters.remote.toString())
      if (newFilters.salaryMin) params.append('salaryMin', newFilters.salaryMin.toString())
      if (newFilters.salaryMax) params.append('salaryMax', newFilters.salaryMax.toString())
      if (newFilters.company) params.append('companyId', newFilters.company)
      if (newFilters.skills?.length) {
        params.append('skillIds', newFilters.skills.join(','))
      }
      params.append('page', pageNum.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        const newJobs = Array.isArray(data.data?.jobs) ? data.data.jobs : []
        setJobs(append ? [...jobs, ...newJobs] : newJobs)
        setTotalJobs(data.data?.pagination?.total || 0)
        setHasMore(newJobs.length === 12)
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
        const appliedJobIds = new Set<string>(data.data.map((app: any) => app.jobId as string))
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

  const handleJobClick = (job: any) => {
    setSelectedJob(job)
  }

  const handleApply = async (jobId: string) => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    if (user.role !== 'TALENT') {
      showToast('Only talent can apply to jobs', 'error')
      return
    }

    setSelectedJobId(jobId)
    setShowApplyModal(true)
  }

  const submitApplication = async () => {
    if (!selectedJobId) return

    setApplying(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: selectedJobId, coverLetter }),
      })

      const data = await response.json()

      if (data.success) {
        setAppliedJobs(prev => new Set([...prev, selectedJobId]))
        showToast('Application submitted successfully!', 'success')
        setShowApplyModal(false)
        setCoverLetter('')
        setSelectedJobId(null)
      } else {
        showToast(data.error || 'Failed to submit application', 'error')
      }
    } catch (error) {
      console.error('Error applying to job:', error)
      showToast('Failed to submit application', 'error')
    } finally {
      setApplying(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd < -100) {
      setSelectedJob(null)
    }
  }

  const handleApplyTouchStart = (e: React.TouchEvent) => {
    setApplyTouchStart(e.targetTouches[0].clientY)
  }

  const handleApplyTouchMove = (e: React.TouchEvent) => {
    setApplyTouchEnd(e.targetTouches[0].clientY)
  }

  const handleApplyTouchEnd = () => {
    if (applyTouchStart - applyTouchEnd < -100) {
      setShowApplyModal(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchJobs(filters, nextPage, true)
  }

  return (
    <>
      {ToastComponent}
      
      {/* Job Detail Sidebar */}
      {selectedJob && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedJob(null)} />
          <div 
            className="fixed bottom-0 md:right-0 md:top-0 left-0 right-0 md:left-auto h-[90vh] md:h-full w-full md:w-[800px] bg-white shadow-2xl z-50 md:overflow-y-auto rounded-t-3xl md:rounded-none flex flex-col transition-transform duration-[400ms] ease-out"
            style={{
              transform: selectedJob ? 'translateY(0)' : 'translateY(100%)'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2 cursor-pointer" onClick={() => setSelectedJob(null)}></div>
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="flex items-start justify-between gap-3 p-4 md:p-6">
                <h2 className="text-base md:text-2xl font-bold text-gray-900 flex-1 leading-tight">{selectedJob.title}</h2>
                <button onClick={() => setSelectedJob(null)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Company Info */}
              {selectedJob.company && (
                <div className="flex items-center gap-3">
                  {selectedJob.company.logoUrl ? (
                    <img src={selectedJob.company.logoUrl} alt={selectedJob.company.name} className="w-12 h-12 rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white font-bold">
                      {selectedJob.company.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{selectedJob.company.name}</p>
                    <p className="text-sm text-gray-500">{selectedJob.location || 'Remote'}</p>
                  </div>
                </div>
              )}

              {/* Salary & Remote */}
              <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                {selectedJob.salaryMin && (
                  <div className="flex items-center gap-2 text-brand-purple font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedJob.currency || 'USD'} {selectedJob.salaryMin.toLocaleString()}
                    {selectedJob.salaryMax && ` - ${selectedJob.salaryMax.toLocaleString()}`}
                  </div>
                )}
                {selectedJob.remote && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    🌍 Remote
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Job Description</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Requirements</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>
              )}

              {/* Skills */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill: any) => (
                      <span key={skill.id} className="bg-purple-50 text-brand-purple border border-purple-200 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-semibold">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Apply Button - Fixed Footer */}
            <div className="border-t bg-white p-4 md:p-6">
              {!user ? (
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-brand-purple hover:bg-purple-700 font-semibold py-6"
                >
                  Log In to Apply
                </Button>
              ) : user.role === 'TALENT' ? (
                <Button
                  onClick={() => {
                    setSelectedJobId(selectedJob.id)
                    setShowApplyModal(true)
                  }}
                  disabled={appliedJobs.has(selectedJob.id)}
                  className="w-full bg-brand-purple hover:bg-purple-700 font-semibold disabled:bg-gray-300 py-6"
                >
                  {appliedJobs.has(selectedJob.id) ? '✓ Applied' : 'Apply Now'}
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Apply Modal Sidebar */}
      {showApplyModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowApplyModal(false)} />
          <div 
            className="fixed bottom-0 md:right-0 md:top-0 left-0 right-0 md:left-auto h-[85vh] md:h-full w-full md:w-[500px] bg-white shadow-2xl z-50 rounded-t-3xl md:rounded-none transition-transform duration-[400ms] ease-out"
            style={{
              transform: showApplyModal ? 'translateY(0)' : 'translateY(100%)'
            }}
            onTouchStart={handleApplyTouchStart}
            onTouchMove={handleApplyTouchMove}
            onTouchEnd={handleApplyTouchEnd}
          >
            <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-2 cursor-pointer" onClick={() => setShowApplyModal(false)}></div>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 md:p-6 border-b">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">Apply for Job</h2>
                <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter (Optional)</label>
                    <textarea
                      rows={10}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell us why you're a great fit for this role..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-6 border-t bg-gray-50">
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowApplyModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitApplication}
                    disabled={applying}
                    className="flex-1 bg-brand-purple hover:bg-purple-700"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Find Your Dream Job</h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Discover {totalJobs} <span className="text-brand-yellow font-semibold">quality opportunities</span> from top companies
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-12">
        <div className="max-w-7xl mx-auto">
        <JobSearchFilters 
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />

        <div className="mt-8">
        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-purple border-t-transparent"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading amazing opportunities...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search filters to find more opportunities.</p>
            <Button 
              onClick={() => handleFiltersChange({})}
              className="bg-brand-purple hover:bg-purple-700"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 font-medium">
                Showing {jobs.length} of {totalJobs} jobs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {jobs.map((job) => (
                <div key={job.id} onClick={() => handleJobClick(job)} className="cursor-pointer">
                  <JobCard
                    job={job}
                    onApply={handleApply}
                    isApplied={appliedJobs.has(job.id)}
                    showApplyButton={false}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pb-12">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  size="lg"
                  className="bg-brand-purple hover:bg-purple-700 px-8"
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Jobs'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
        </div>
        </div>
      </div>
    </div>
    </>
  )
}