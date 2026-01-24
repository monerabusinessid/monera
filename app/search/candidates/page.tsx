'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

interface Candidate {
  id: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  location: string | null
  user: {
    email: string
  }
  skills: Array<{ id: string; name: string }>
  _count: {
    applications: number
  }
}

function SearchCandidatesForm() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      fetchCandidates()
    } else {
      setLoading(false)
    }
  }, [query])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      // Mock data for demo - replace with actual API call
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          firstName: 'Muhammad',
          lastName: 'Abdullah E.',
          bio: 'AI/ML Engineer specializing in chatbot development',
          location: 'Remote',
          user: { email: 'muhammad@example.com' },
          skills: [{ id: '1', name: 'AI' }, { id: '2', name: 'Chatbot' }, { id: '3', name: 'Python' }],
          _count: { applications: 15 },
        },
        {
          id: '2',
          firstName: 'Dmytro',
          lastName: 'U.',
          bio: 'Full-stack developer with expertise in automation',
          location: 'Ukraine',
          user: { email: 'dmytro@example.com' },
          skills: [{ id: '4', name: 'JavaScript' }, { id: '5', name: 'Node.js' }],
          _count: { applications: 8 },
        },
        {
          id: '3',
          firstName: 'Conner',
          lastName: 'B.',
          bio: 'Creative director and brand identity specialist',
          location: 'USA',
          user: { email: 'conner@example.com' },
          skills: [{ id: '6', name: 'Design' }, { id: '7', name: 'Branding' }],
          _count: { applications: 12 },
        },
        {
          id: '4',
          firstName: 'Felipe',
          lastName: 'R.',
          bio: 'Data analyst and machine learning expert',
          location: 'Brazil',
          user: { email: 'felipe@example.com' },
          skills: [{ id: '8', name: 'Data Science' }, { id: '9', name: 'Python' }],
          _count: { applications: 20 },
        },
      ]
      setCandidates(mockCandidates)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-3">
                We found thousands of top-rated {query.toLowerCase()} pros
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-orange-400 text-xl">★</span>
                  ))}
                </div>
                <span className="font-semibold">Rated 4.8 / 5 on avg.</span>
              </div>
              <p className="text-gray-500 text-sm">From over 1k+ past clients</p>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-brand-purple rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 mx-auto">
                          {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                        </div>
                        <div className="absolute top-0 right-0 w-4 h-4 bg-brand-purple rounded-full border-2 border-white"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">★</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-center mb-1">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 text-center mb-2">{candidate.bio}</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {candidate.skills.slice(0, 2).map((skill) => (
                          <span key={skill.id} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <Button className="w-full bg-brand-purple hover:bg-purple-700 text-white h-12">
                Continue
              </Button>
              <div className="flex gap-4 justify-center text-sm">
                <Link href="/how-hiring-works" className="text-brand-purple hover:underline">
                  How hiring works
                </Link>
                <Link href="/pricing" className="text-brand-purple hover:underline">
                  Platform pricing
                </Link>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                We use AI to power this experience.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function SearchCandidatesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchCandidatesForm />
    </Suspense>
  )
}
