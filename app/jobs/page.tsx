'use client'

import { useState, useEffect } from 'react'
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
    id: string
    name: string
    logoUrl: string | null
  } | null
  skills: Array<{ id: string; name: string }>
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    remote: '',
    workType: 'any',
    page: 1,
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('query')
    if (query) {
      setFilters(prev => ({ ...prev, query }))
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [filters.page, filters.query, filters.location, filters.remote, filters.workType])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: 'PUBLISHED',
        page: filters.page.toString(),
        limit: '20',
      })
      if (filters.query) params.append('query', filters.query)
      if (filters.location) params.append('location', filters.location)
      if (filters.remote === 'true') params.append('remote', 'true')
      if (filters.workType && filters.workType !== 'any') params.append('category', filters.workType)

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()
      if (data.success) {
        setJobs(data.data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const workTypes = [
    { label: 'Any type of work', value: 'any' },
    { label: 'Development & IT', value: 'Development & IT' },
    { label: 'Design & Creative', value: 'Design & Creative' },
    { label: 'Finance & Accounting', value: 'Finance & Accounting' },
    { label: 'Admin & Customer Support', value: 'Admin & Customer Support' },
    { label: 'Engineering & Architecture', value: 'Engineering & Architecture' },
    { label: 'Legal', value: 'Legal' },
    { label: 'Sales & Marketing', value: 'Sales & Marketing' },
    { label: 'Writing & Translation', value: 'Writing & Translation' },
  ]


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950 text-white pt-32 sm:pt-28 pb-12 md:pb-16 overflow-hidden -mt-20 sm:-mt-24">
        {/* Animated Background - Enhanced Stars/Particles */}
        <div className="absolute inset-0 overflow-hidden -top-20 md:-top-24">
          {/* Enhanced animated stars/particles */}
          <div className="absolute inset-0">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${Math.random() * 4 + 2}s`,
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Large animated bubbles */}
          <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-brand-yellow/40 via-purple-400/30 to-indigo-400/30 rounded-full blur-3xl animate-float-slow opacity-80"></div>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-brand-yellow/30 rounded-full blur-3xl animate-float-reverse opacity-70"></div>
          
          {/* Enhanced Medium floating bubbles */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/25 to-indigo-400/25 rounded-full blur-2xl animate-float-medium opacity-60"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-yellow/25 to-purple-400/25 rounded-full blur-2xl animate-float-slow opacity-50"></div>
          
          {/* Enhanced Small floating particles */}
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-float-fast opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl animate-float-medium opacity-60"></div>
          
          {/* Additional pulsing glow effects */}
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse-slow transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pt-2">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 font-headline leading-[1.1] tracking-tight animate-fade-in">
              Find the Best <span className="text-brand-yellow">Talent Jobs</span>
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-6 md:mb-8 leading-relaxed opacity-90 animate-slide-up">
              Browse jobs posted on Monera, or create a free profile to find the work you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-semibold shadow-md mb-6">
                  Find jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-t-3xl -mt-6 sm:-mt-8 relative z-10">
        <div className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Type of Work */}
          <div className="lg:col-span-1">
            <h2 className="font-semibold text-lg mb-4">Type of work</h2>
            <div className="space-y-2">
              {workTypes.map((type, idx) => (
                <label key={idx} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="workType"
                    value={type.value}
                    checked={filters.workType === type.value}
                    onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
                    className="w-4 h-4 text-brand-purple accent-brand-yellow"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column - Jobs List */}
          <div className="lg:col-span-2">
            {/* Jobs List */}
            {loading ? (
              <div className="text-center py-12">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No jobs found</p>
                <Button onClick={() => setFilters({ ...filters, query: '', location: '', remote: '', workType: 'any' })}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => {
                  const jobUrl = `/jobs/${job.id}`
                  console.log('JobsPage: Rendering job card:', { id: job.id, title: job.title, url: jobUrl })
                  return (
                  <Link key={job.id} href={jobUrl} onClick={() => console.log('JobsPage: Clicked job link:', jobUrl)}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-2xl">{job.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {job.company?.name || 'Company'}
                              {job.location && !job.remote && ` • ${job.location}`}
                              {job.remote && ' • Remote'}
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
                          {job.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-1 bg-gradient-to-r from-purple-50 to-yellow-50 text-purple-700 text-xs rounded border border-purple-200"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  )
}
