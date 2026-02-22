'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

interface JobSearchFiltersProps {
  onFiltersChange: (filters: JobFilters) => void
  loading?: boolean
}

export interface JobFilters {
  query?: string
  location?: string
  remote?: boolean
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  company?: string
}

export function JobSearchFilters({ onFiltersChange, loading }: JobSearchFiltersProps) {
  const [filters, setFilters] = useState<JobFilters>({})
  const [skills, setSkills] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [skillsRes, companiesRes] = await Promise.all([
          fetch('/api/skills'),
          fetch('/api/companies')
        ])
        
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          setSkills(Array.isArray(skillsData.data) ? skillsData.data : [])
        }
        
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()
          setCompanies(Array.isArray(companiesData.data) ? companiesData.data : [])
        }
      } catch (error) {
        console.error('Error fetching filter data:', error)
      }
    }

    fetchFilterData()
  }, [])

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Debounce untuk text inputs (query, location)
    if (key === 'query' || key === 'location') {
      // Clear previous timeout
      if (window.filterTimeout) clearTimeout(window.filterTimeout)
      // Set new timeout
      window.filterTimeout = setTimeout(() => {
        onFiltersChange(newFilters)
      }, 500)
    } else {
      // Immediate untuk dropdowns
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  return (
    <Card className="shadow-xl border-0 bg-white rounded-2xl">
      <CardContent className="p-6">
        {/* Quick Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Input
              placeholder="Search by job title, skills, or company..."
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-12 pr-4 py-6 text-base rounded-xl border-2 border-gray-200 focus:border-brand-purple"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-brand-purple font-semibold mb-4 flex items-center gap-2 hover:text-purple-700">
            <svg className="w-5 h-5 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Filters
          </summary>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <Input
                  placeholder="City or country"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
                <select
                  className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                  value={filters.remote === undefined ? '' : filters.remote ? 'remote' : 'onsite'}
                  onChange={(e) => {
                    const value = e.target.value
                    handleFilterChange('remote', value === '' ? undefined : value === 'remote')
                  }}
                >
                  <option value="">All Types</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                <select
                  className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                  value={filters.company || ''}
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Salary (USD)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50,000"
                  value={filters.salaryMin || ''}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="rounded-lg border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Salary (USD)</label>
                <Input
                  type="number"
                  placeholder="e.g. 150,000"
                  value={filters.salaryMax || ''}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="rounded-lg border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
              <select
                className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                onChange={(e) => {
                  const skillId = e.target.value
                  if (skillId && !filters.skills?.includes(skillId)) {
                    handleFilterChange('skills', [...(filters.skills || []), skillId])
                  }
                  e.target.value = ''
                }}
              >
                <option value="">+ Add skill filter</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            {filters.skills && filters.skills.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Skills:</label>
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skillId) => {
                    const skill = skills.find(s => s.id === skillId)
                    return skill ? (
                      <span
                        key={skillId}
                        className="bg-brand-purple text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm"
                      >
                        {skill.name}
                        <button
                          onClick={() => {
                            const newSkills = filters.skills?.filter(id => id !== skillId)
                            handleFilterChange('skills', newSkills?.length ? newSkills : undefined)
                          }}
                          className="hover:bg-purple-600 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </details>

        {/* Clear Filters Button */}
        {(filters.query || filters.location || filters.remote !== undefined || filters.salaryMin || filters.salaryMax || filters.company || filters.skills?.length) && (
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-lg border-2 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}