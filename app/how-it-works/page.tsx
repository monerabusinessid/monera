'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HowItWorksPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || 'https://calendar.google.com/calendar/u/0/r/eventedit?add=monerabusiness.id@gmail.com&text=Monera%20Intro%20Call&details=Intro%20call%20with%20Monera%20team'
  const isCalendarExternal = calendarUrl.startsWith('http')

  const steps = [
    {
      step: 1,
      title: 'Book Free Consultation',
      description: 'Schedule a call with our team. Share your requirements, budget, and team goals. We\'ll explain how Monera works and answer all your questions.',
      icon: '📞',
      duration: '30 minutes',
    },
    {
      step: 2,
      title: 'Receive Pre-Vetted Candidates',
      description: 'Within 48 hours, get 3 qualified candidates matched to your needs. Review their profiles, portfolios, and experience.',
      icon: '👥',
      duration: '48 hours',
    },
    {
      step: 3,
      title: 'Interview & Select',
      description: 'Interview candidates via video call. Choose the best fit for your team. We guide you through the selection process.',
      icon: '🎯',
      duration: '2-3 days',
    },
    {
      step: 4,
      title: 'Seamless Onboarding',
      description: 'We handle contracts, equipment setup, and HR paperwork. Your new team member is ready to start working.',
      icon: '🚀',
      duration: '3-5 days',
    },
  ]

  const benefits = [
    {
      title: 'No Recruitment Hassle',
      description: 'We handle sourcing, screening, and vetting. You only interview the best candidates.',
      icon: '✅',
    },
    {
      title: 'Complete HR Management',
      description: 'Contracts, payroll, taxes, benefits, and compliance - all managed by us.',
      icon: '📋',
    },
    {
      title: 'Dedicated Account Manager',
      description: 'Your dedicated point of contact for any questions or support needs.',
      icon: '🤝',
    },
    {
      title: '30-Day Guarantee',
      description: 'Not satisfied? We\'ll find you a replacement within 30 days at no extra cost.',
      icon: '🛡️',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              How It Works
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              From consultation to onboarding in <span className="text-brand-yellow font-bold">4 simple steps</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-16 bg-white -mt-20 relative z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item) => (
                <Card key={item.step} className="text-center border-2 border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <CardHeader>
                    <div className="text-6xl mb-4">{item.icon}</div>
                    <div className="w-16 h-16 bg-brand-purple text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl font-bold mb-2">{item.title}</CardTitle>
                    <div className="inline-block px-3 py-1 bg-purple-50 text-brand-purple text-sm font-semibold rounded-full">
                      {item.duration}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Handle For You</h2>
              <p className="text-lg text-gray-600">Focus on your business while we manage everything else</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx} className="border-2 border-gray-200 hover:border-brand-purple hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">{benefit.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-brand-purple to-purple-700 text-white border-0 rounded-3xl shadow-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                  Book a free consultation and get 3 pre-vetted candidates in 48 hours
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {isCalendarExternal ? (
                    <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold px-10 py-6 text-lg shadow-lg">
                        Book Free Consultation →
                      </Button>
                    </a>
                  ) : (
                    <Link href={calendarUrl}>
                      <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold px-10 py-6 text-lg shadow-lg">
                        Book Free Consultation →
                      </Button>
                    </Link>
                  )}
                  <a href="https://wa.me/6285161391439?text=Hi%20Monera,%20I%20want%20to%20learn%20more" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="!border-2 !border-white !text-white hover:!bg-white/20 font-semibold px-10 py-6 text-lg">
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
