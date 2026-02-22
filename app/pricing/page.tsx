'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingPage() {
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || 'https://calendar.google.com/calendar/u/0/r/eventedit?add=monerabusiness.id@gmail.com&text=Monera%20Intro%20Call&details=Intro%20call%20with%20Monera%20team'
  const isCalendarExternal = calendarUrl.startsWith('http')

  const customIcons = {
    check: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="url(#gradient1)"/>
        <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              All-inclusive packages. <span className="text-brand-yellow">No hidden fees.</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Included in Every Package</h2>
              <p className="text-xl text-purple-100">All-inclusive pricing. No surprises.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0">{customIcons.check}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Full Salary Coverage</h3>
                    <p className="text-purple-100">Competitive salary for top-tier Indonesian talent</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0">{customIcons.check}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Taxes & Benefits</h3>
                    <p className="text-purple-100">All local taxes, insurance, and statutory benefits</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0">{customIcons.check}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">HR Management</h3>
                    <p className="text-purple-100">Complete HR administration and support</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0">{customIcons.check}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Payroll Processing</h3>
                    <p className="text-purple-100">Monthly payroll handled seamlessly</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0">{customIcons.check}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Legal Compliance</h3>
                    <p className="text-purple-100">Full compliance with Indonesian labor laws</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0">{customIcons.check}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Platform Fee</h3>
                    <p className="text-purple-100">Access to our platform and support team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Service Tier</h2>
              <p className="text-xl text-gray-600">Pricing varies by role complexity and experience level</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Operational Excellence</CardTitle>
                  <CardDescription className="text-base">Entry to Mid-Level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-brand-purple mb-2">$750 - $1,200</p>
                    <p className="text-sm text-gray-500">per month, all-inclusive</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Executive Assistant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Customer Success Rep</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Data Entry Specialist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">General Admin</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-4 border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-purple-50 to-yellow-50/30 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-yellow text-gray-900 px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</span>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-2xl font-bold">Growth & Creative</CardTitle>
                  <CardDescription className="text-base">Mid to Senior Level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-brand-purple mb-2">$1,200 - $2,000</p>
                    <p className="text-sm text-gray-500">per month, all-inclusive</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Social Media Manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Graphic Designer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Video Editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Content Writer</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Technical & Specialized</CardTitle>
                  <CardDescription className="text-base">Senior to Expert Level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-brand-purple mb-2">$2,000 - $3,500</p>
                    <p className="text-sm text-gray-500">per month, all-inclusive</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Web Developer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">QA Engineer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">UI/UX Designer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-5 h-5 flex-shrink-0">{customIcons.check}</div>
                      <span className="text-sm">Bookkeeper/Accountant</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Your Custom Quote</h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Book a free consultation to discuss your needs and get a tailored pricing proposal
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
