'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import Link from 'next/link'

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<'talent' | 'recruiter'>('talent')

  const talentFlow = [
    {
      step: 1,
      title: 'Create Profile',
      description: 'Build your professional profile with skills, experience, portfolio, and set your hourly rate.',
      icon: '👤',
    },
    {
      step: 2,
      title: 'Get Vetted',
      description: 'Our system validates your profile completeness. Achieve 80%+ to unlock best match jobs.',
      icon: '✅',
    },
    {
      step: 3,
      title: 'Get Matched',
      description: 'Receive job recommendations ranked by match score. See jobs that actually fit your skills.',
      icon: '🎯',
    },
    {
      step: 4,
      title: 'Work Remotely',
      description: 'Apply to quality jobs and start working with vetted clients on meaningful projects.',
      icon: '🌍',
    },
  ]

  const recruiterFlow = [
    {
      step: 1,
      title: 'Post Job',
      description: 'Create a job posting with required skills, budget, and job details.',
      icon: '📝',
    },
    {
      step: 2,
      title: 'Talent Search',
      description: 'Search and filter vetted talent by skills, rate, availability, and profile readiness.',
      icon: '🔍',
    },
    {
      step: 3,
      title: 'Review Applicants',
      description: 'See only ready profiles. Review applications with profile readiness badges.',
      icon: '📋',
    },
    {
      step: 4,
      title: 'Hire & Collaborate',
      description: 'Shortlist, accept, and start working with quality talent remotely.',
      icon: '🤝',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-brand-purple to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">How It Works</h1>
            <p className="text-xl text-purple-100">
              Quality-first talent marketplace for both talent and recruiters
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4 max-w-2xl mx-auto">
            <Button
              variant={activeTab === 'talent' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('talent')}
              className={activeTab === 'talent' ? 'bg-brand-purple' : ''}
            >
              For Talent
            </Button>
            <Button
              variant={activeTab === 'recruiter' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setActiveTab('recruiter')}
              className={activeTab === 'recruiter' ? 'bg-brand-purple' : ''}
            >
              For Recruiter
            </Button>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {activeTab === 'talent' ? (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Talent Journey</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {talentFlow.map((item) => (
                  <Card key={item.step} className="text-center border-2">
                    <CardHeader>
                      <div className="text-5xl mb-4">{item.icon}</div>
                      <div className="w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        {item.step}
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Recruiter Journey</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recruiterFlow.map((item) => (
                  <Card key={item.step} className="text-center border-2">
                    <CardHeader>
                      <div className="text-5xl mb-4">{item.icon}</div>
                      <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        {item.step}
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/register?role=CANDIDATE">
              <Button size="lg" className="bg-brand-purple hover:bg-purple-700 text-lg px-8 py-6">
                Join as Talent
              </Button>
            </Link>
            <Link href="/register?role=RECRUITER">
              <Button size="lg" variant="outline" className="border-brand-purple text-brand-purple hover:bg-purple-50 text-lg px-8 py-6">
                Hire Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
