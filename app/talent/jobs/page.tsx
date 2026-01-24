'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingData, setLoadingData] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchSkills()
      fetchJobs()
    }
  }, [user, loading, router, currentPage, filters])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      if (data.success) {
        setAllSkills(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    }
  }

  const fetchJobs = async () => {
    setLoadingData(true)
    try {
      const params = new URLSearchParams({
        status: 'PUBLISHED',
        page: currentPage.toString(),
        limit: '20',
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
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
    setCurrentPage(1)
  }

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
    setCurrentPage(1)
  }

  const hasActiveFilters = filters.query || filters.skillIds.length > 0 || filters.salaryMin || filters.salaryMax

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find your next opportunity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="border-2 sticky top-24">
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-white hover:bg-white/20 h-6 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <Label htmlFor="query" className="text-sm font-semibold">Keyword Search</Label>
                  <Input
                    id="query"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    placeholder="Search jobs..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Skills</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {allSkills.length === 0 ? (
                      <p className="text-xs text-gray-500">Loading skills...</p>
                    ) : (
                      allSkills.map((skill) => (
                        <label key={skill.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-1 rounded">
                          <input
                            type="checkbox"
                            checked={filters.skillIds.includes(skill.id)}
                            onChange={() => handleSkillToggle(skill.id)}
                            className="w-4 h-4 text-brand-purple rounded focus:ring-brand-purple"
                          />
                          <span className="text-sm text-gray-700">{skill.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="salaryMin" className="text-sm font-semibold">Min Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={filters.salaryMin}
                      onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="text-sm font-semibold">Max Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={filters.salaryMax}
                      onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                      placeholder="100000"
                      className="mt-1"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>

            {jobs.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-gray-600 mb-4 text-lg">No jobs found</p>
                  {hasActiveFilters ? (
                    <Button onClick={clearFilters} className="bg-brand-purple hover:bg-purple-700">
                      Clear Filters
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link key={job.id} href={`/talent/jobs/${job.id}`}>
                      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-brand-purple cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-brand-purple transition-colors mb-2">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 flex-wrap">
                                <span className="font-medium text-gray-900">
                                  {job.company?.name || job.recruiter?.name || job.recruiter?.email || 'No company'}
                                </span>
                                {job.location && job.location.toLowerCase() !== 'remote' && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span>{job.location}</span>
                                  </>
                                )}
                                {job.remote && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-green-600 font-medium">🌍 Remote</span>
                                  </>
                                )}
                              </div>
                              <p className="text-gray-700 line-clamp-2 mb-4">{job.description}</p>
                              {job.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {job.skills.slice(0, 5).map((skill) => (
                                    <span
                                      key={skill.id}
                                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                  {job.skills.length > 5 && (
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                      +{job.skills.length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {job.salaryMin && (
                              <div className="text-right ml-4 flex-shrink-0">
                                <div className="text-lg font-bold text-brand-purple">
                                  {job.currency || '$'}{job.salaryMin.toLocaleString()}
                                  {job.salaryMax && ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">/hour</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-xs text-gray-500">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <Button variant="outline" size="sm" className="bg-brand-purple hover:bg-purple-700 text-white border-brand-purple">
                              View Details →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      size="sm"
                    >
                      ← Previous
                    </Button>
                    <span className="text-sm text-gray-600 px-4 py-2 bg-white rounded border">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      size="sm"
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TalentJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
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
