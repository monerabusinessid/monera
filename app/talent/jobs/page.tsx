'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    name?: string | null
  }
  skills: Array<{ id: string; name: string }>
  createdAt: string
}

interface Skill {
  id: string
  name: string
}

function TalentJobsForm() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    skillIds: [] as string[],
    salaryMin: '',
    salaryMax: '',
  })
  const [queryInput, setQueryInput] = useState(searchParams.get('query') || '')
  const [salaryMinInput, setSalaryMinInput] = useState('')
  const [salaryMaxInput, setSalaryMaxInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [loadingData, setLoadingData] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchSkills = useCallback(async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      if (data.success) {
        setAllSkills(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    }
  }, [])

  const fetchJobs = useCallback(async () => {
    setLoadingData(true)
    try {
      const params = new URLSearchParams({
        status: 'PUBLISHED',
        page: currentPage.toString(),
        limit: '10',
      })

      if (filters.query) params.append('query', filters.query)
      if (filters.skillIds.length > 0) params.append('skillIds', filters.skillIds.join(','))
      if (filters.salaryMin) params.append('salaryMin', filters.salaryMin)
      if (filters.salaryMax) params.append('salaryMax', filters.salaryMax)

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()

      if (data.success) {
        setJobs(data.data.jobs || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
        setTotalJobs(data.data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoadingData(false)
    }
  }, [currentPage, filters])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchSkills()
    }
  }, [user, loading, router, fetchSkills])

  useEffect(() => {
    if (user && user.role === 'TALENT') {
      fetchJobs()
    }
  }, [user, fetchJobs])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => {
        const nextQuery = queryInput.trim()
        const nextSalaryMin = salaryMinInput.trim()
        const nextSalaryMax = salaryMaxInput.trim()

        const nextFilters = {
          ...prev,
          query: nextQuery,
          salaryMin: nextSalaryMin,
          salaryMax: nextSalaryMax,
        }

        if (
          nextFilters.query === prev.query &&
          nextFilters.salaryMin === prev.salaryMin &&
          nextFilters.salaryMax === prev.salaryMax
        ) {
          return prev
        }

        return nextFilters
      })
      setCurrentPage(1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [queryInput, salaryMinInput, salaryMaxInput])

  const handleSkillToggle = (skillId: string) => {
    setFilters((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId],
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      skillIds: [],
      salaryMin: '',
      salaryMax: '',
    })
    setQueryInput('')
    setSalaryMinInput('')
    setSalaryMaxInput('')
    setCurrentPage(1)
  }

  const hasActiveFilters = filters.query || filters.skillIds.length > 0 || filters.salaryMin || filters.salaryMax

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-gray-900">Find Jobs</h1>
          <p className="text-sm text-gray-500">Discover roles that match your skills and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="border border-gray-100 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Filters
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                      Clear
                    </Button>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">Refine search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="query" className="text-xs font-semibold text-gray-600">Keyword</Label>
                  <Input
                    id="query"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="Search job title..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 mb-2 block">Skills</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg border border-gray-100 p-3 bg-gray-50">
                    {allSkills.length === 0 ? (
                      <p className="text-xs text-gray-500">Loading skills...</p>
                    ) : (
                      allSkills.map((skill) => (
                        <label key={skill.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={filters.skillIds.includes(skill.id)}
                            onChange={() => handleSkillToggle(skill.id)}
                            className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                          />
                          {skill.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="salaryMin" className="text-xs font-semibold text-gray-600">Min</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={salaryMinInput}
                      onChange={(e) => setSalaryMinInput(e.target.value)}
                      placeholder="0"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="text-xs font-semibold text-gray-600">Max</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={salaryMaxInput}
                      onChange={(e) => setSalaryMaxInput(e.target.value)}
                      placeholder="100000"
                      className="mt-2"
                    />
                  </div>
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full rounded-full">
                    Reset Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full rounded-full">
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>{totalJobs} jobs found</span>
              <span>{hasActiveFilters ? 'Filtered' : 'All results'}</span>
            </div>

            {loadingData ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-10 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-brand-purple"></div>
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </CardContent>
              </Card>
            ) : jobs.length === 0 ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-10 text-center">
                  <div className="text-4xl mb-4"></div>
                  <p className="text-gray-600 mb-4 text-lg">No jobs found</p>
                  {hasActiveFilters ? (
                    <Button onClick={clearFilters} className="bg-brand-purple hover:bg-purple-700 rounded-full">
                      Clear Filters
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">Try adjusting your search criteria.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/talent/jobs/${job.id}`}>
                    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer mb-4">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-[240px]">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {job.company?.name || job.recruiter?.name || job.recruiter?.email || 'No company'}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                              {job.remote && <span className="rounded-full bg-gray-100 px-3 py-1">Remote</span>}
                              {job.location && !job.remote && (
                                <span className="rounded-full bg-gray-100 px-3 py-1">{job.location}</span>
                              )}
                              {job.salaryMin && (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                                  {job.currency || '$'}{job.salaryMin.toLocaleString()}
                                  {job.salaryMax ? ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}` : ''}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{job.description}</p>
                            {job.skills.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {job.skills.slice(0, 4).map((skill) => (
                                  <span key={skill.id} className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
                                    {skill.name}
                                  </span>
                                ))}
                                {job.skills.length > 4 && (
                                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                                    +{job.skills.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <span className="text-xs text-gray-400">
                              Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <Button variant="outline" size="sm" className="rounded-full px-4 border-brand-purple text-brand-purple">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-4 py-2 bg-white rounded-full border">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function TalentJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TalentJobsForm />
    </Suspense>
  )
}


