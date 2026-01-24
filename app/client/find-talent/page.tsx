'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Candidate {
  id: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  location: string | null
  headline: string | null
  hourlyRate: number | null
  availability: string | null
  portfolioUrl: string | null
  linkedInUrl: string | null
  githubUrl: string | null
  user: {
    id: string
    email: string
  }
  skills: Array<{ id: string; name: string }>
  _count: {
    applications: number
  }
}

export default function ClientFindTalentPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    skillIds: [] as string[],
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchSkills()
    // Initial search with empty filters
    performSearch(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills', {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setSkills(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    }
  }


  const performSearch = async (page: number = 1) => {
    setSearching(true)
    setPagination(prev => ({ ...prev, page }))
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.query) {
        params.append('query', filters.query)
      }
      if (filters.location) {
        params.append('location', filters.location)
      }
      if (filters.skillIds.length > 0) {
        params.append('skillIds', filters.skillIds.join(','))
      }

      const response = await fetch(`/api/search/candidates?${params.toString()}`, {
        credentials: 'include',
      })

      const data = await response.json()
      if (data.success) {
        setCandidates(data.data.candidates || [])
        setPagination(prev => ({ ...prev, ...data.data.pagination }))
      } else {
        console.error('Search failed:', data.error)
      }
    } catch (error) {
      console.error('Failed to search candidates:', error)
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await performSearch(1)
  }

  const handleSkillToggle = (skillId: string) => {
    setFilters(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId],
    }))
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-headline">Find Talent</h1>
        <p className="text-gray-600 mt-1">Search and discover talented professionals for your projects</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="query">Search by name or bio</Label>
                <Input
                  id="query"
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="e.g., React Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Remote, New York"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border p-3 rounded-md">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.skillIds.includes(skill.id)}
                      onChange={() => handleSkillToggle(skill.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={searching} className="w-full">
              {searching ? 'Searching...' : 'Search Talent'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {pagination.total > 0 ? `Found ${pagination.total} talent${pagination.total > 1 ? 's' : ''}` : 'No results found'}
          </h2>
        </div>

        {candidates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No talent found. Try adjusting your search filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {candidate.firstName} {candidate.lastName}
                        </CardTitle>
                        {candidate.headline && (
                          <p className="text-sm text-gray-600 mt-1">{candidate.headline}</p>
                        )}
                      </div>
                    </div>
                    {candidate.availability === 'Open' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Available
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{candidate.bio}</p>
                  )}
                  
                  {candidate.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📍</span>
                      <span>{candidate.location}</span>
                    </div>
                  )}

                  {candidate.hourlyRate && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-semibold">${candidate.hourlyRate}/hr</span>
                    </div>
                  )}

                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {candidate.skills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{candidate.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-gray-500">
                      {candidate._count.applications} application{candidate._count.applications !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      {candidate.portfolioUrl && (
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-purple hover:underline"
                        >
                          Portfolio
                        </a>
                      )}
                      {candidate.linkedInUrl && (
                        <a
                          href={candidate.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-purple hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.page === 1 || searching}
              onClick={() => performSearch(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages || searching}
              onClick={() => performSearch(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
