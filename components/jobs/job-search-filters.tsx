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
          setSkills(skillsData.data || [])
        }
        
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()
          setCompanies(companiesData.data || [])
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
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Jobs</label>
            <Input
              placeholder="Job title, skills, company..."
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              placeholder="City, country, or remote"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Min Salary (USD)</label>
            <Input
              type="number"
              placeholder="50000"
              value={filters.salaryMin || ''}
              onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Salary (USD)</label>
            <Input
              type="number"
              placeholder="150000"
              value={filters.salaryMax || ''}
              onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Work Type</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filters.remote === undefined ? '' : filters.remote ? 'remote' : 'onsite'}
              onChange={(e) => {
                const value = e.target.value
                handleFilterChange('remote', value === '' ? undefined : value === 'remote')
              }}
              disabled={loading}
            >
              <option value="">All</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <select
              className="w-full p-2 border rounded-md"
              value={filters.company || ''}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              disabled={loading}
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <select
              className="w-full p-2 border rounded-md"
              onChange={(e) => {
                const skillId = e.target.value
                if (skillId && !filters.skills?.includes(skillId)) {
                  handleFilterChange('skills', [...(filters.skills || []), skillId])
                }
              }}
              disabled={loading}
            >
              <option value="">Add skill filter</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filters.skills && filters.skills.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Selected Skills:</label>
            <div className="flex flex-wrap gap-2">
              {filters.skills.map((skillId) => {
                const skill = skills.find(s => s.id === skillId)
                return skill ? (
                  <span
                    key={skillId}
                    className="bg-brand-purple text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill.name}
                    <button
                      onClick={() => {
                        const newSkills = filters.skills?.filter(id => id !== skillId)
                        handleFilterChange('skills', newSkills?.length ? newSkills : undefined)
                      }}
                      className="hover:bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={clearFilters}
            variant="outline"
            disabled={loading}
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}