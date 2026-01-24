'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function PricingPage() {
  const talentPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Create profile',
        'Browse all jobs',
        'Apply to jobs',
        'Basic matching',
        'Profile readiness check',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      features: [
        'Everything in Free',
        'Priority job matching',
        'Enhanced profile visibility',
        'Advanced filters',
        'Direct messaging',
        'Analytics dashboard',
      ],
      cta: 'Upgrade',
      popular: true,
    },
  ]

  const recruiterPlans = [
    {
      name: 'Starter',
      price: '$49',
      period: 'month',
      features: [
        'Post up to 3 jobs',
        'Talent search',
        'View full profiles',
        'Basic applicant management',
        'Email support',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$149',
      period: 'month',
      features: [
        'Unlimited job posts',
        'Advanced talent search',
        'Priority matching',
        'Full applicant management',
        'Direct talent invites',
        'Analytics & reports',
        'Priority support',
      ],
      cta: 'Upgrade',
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-brand-purple via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 font-headline">Simple, Transparent Pricing</h1>
            <p className="text-xl text-purple-100">
              Choose the plan that works for <span className="text-brand-yellow font-semibold">you</span>
            </p>
          </div>
        </div>
      </section>

      {/* Talent Pricing */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">For Talent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {talentPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`border-2 ${plan.popular ? 'border-brand-yellow shadow-lg' : ''} hover:border-brand-yellow transition-colors`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-brand-purple to-brand-yellow text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?role=TALENT">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-semibold shadow-md' : ''}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recruiter Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">For Recruiters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {recruiterPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`border-2 ${plan.popular ? 'border-brand-yellow shadow-lg' : ''} hover:border-brand-yellow transition-colors`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-brand-purple to-brand-yellow text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?role=CLIENT">
                    <Button
                      className={`w-full ${plan.popular ? 'bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-semibold shadow-md' : ''}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
