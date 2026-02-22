'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CaseStudiesPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || 'https://calendar.google.com/calendar/u/0/r/eventedit?add=monerabusiness.id@gmail.com&text=Monera%20Intro%20Call&details=Intro%20call%20with%20Monera%20team'
  const isCalendarExternal = calendarUrl.startsWith('http')

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Success Stories
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Real results from <span className="text-brand-yellow">real companies</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <Card className="border-2 border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 md:p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block px-4 py-2 bg-white rounded-full mb-4">
                    <span className="text-4xl">🇸🇬</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Singapore SaaS Startup</h3>
                  <p className="text-brand-purple font-semibold">Customer Support Team</p>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-bold mb-4">From $3,500 to $850 per month</CardTitle>
                  <CardDescription className="text-base">How a Singapore startup saved 75% on customer support costs</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Challenge:</p>
                    <p className="text-gray-600">Local customer support reps cost $3,500/month. Too expensive for early-stage startup.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Solution:</p>
                    <p className="text-gray-600">Hired dedicated CSR through Monera at $850/month. Fluent English, full-time, fully managed.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Results:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li>✓ 75% cost savings</li>
                      <li>✓ Same quality service</li>
                      <li>✓ Founder focuses on product</li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-8 md:p-12 flex items-center justify-center order-2 md:order-1">
                <div className="text-center">
                  <div className="inline-block px-4 py-2 bg-white rounded-full mb-4">
                    <span className="text-4xl">🇦🇺</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Australian Marketing Agency</h3>
                  <p className="text-brand-purple font-semibold">Video Production Team</p>
                </div>
              </div>
              <div className="p-8 md:p-12 order-1 md:order-2">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-bold mb-4">20+ Videos Per Week</CardTitle>
                  <CardDescription className="text-base">Scaling content production without breaking the bank</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Challenge:</p>
                    <p className="text-gray-600">Needed reliable video editor for TikTok campaigns. Freelancers were inconsistent.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Solution:</p>
                    <p className="text-gray-600">Expert video editor at $1,500/month. Full-time dedicated, producing 20+ videos weekly.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Results:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li>✓ 20+ videos per week</li>
                      <li>✓ Consistent quality</li>
                      <li>✓ Seamless Slack integration</li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          <Card className="border-2 border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 md:p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block px-4 py-2 bg-white rounded-full mb-4">
                    <span className="text-4xl">🇺🇸</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">US E-commerce Brand</h3>
                  <p className="text-brand-purple font-semibold">Operations Team</p>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-bold mb-4">3-Person Remote Team</CardTitle>
                  <CardDescription className="text-base">Building a complete operations team remotely</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Challenge:</p>
                    <p className="text-gray-600">Growing fast but couldn't afford US salaries for ops team ($15k+/month for 3 people).</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Solution:</p>
                    <p className="text-gray-600">Built 3-person team: Executive Assistant, Customer Support, Data Analyst at $3,500/month total.</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Results:</p>
                    <ul className="space-y-2 text-gray-600">
                      <li>✓ 77% cost savings</li>
                      <li>✓ Complete ops coverage</li>
                      <li>✓ Zero HR headaches</li>
                    </ul>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Write Your Success Story?</h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join 100+ companies saving up to 60% on operational costs with Monera
              </p>
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
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
