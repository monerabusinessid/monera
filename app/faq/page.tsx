'use client'

import { useState } from 'react'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: 'For Talent',
      questions: [
        {
          q: 'What is profile readiness?',
          a: 'Profile readiness is our system that validates your profile completeness. You need to achieve 80%+ completion (including full name, headline with 5+ words, 3+ skills, 100+ char bio, hourly rate, portfolio URL, and availability) to unlock best match jobs.',
        },
        {
          q: 'Why can\'t I see best match jobs?',
          a: 'Best match jobs are only visible when your profile is ready (80%+ completion). Complete your profile to unlock this feature.',
        },
        {
          q: 'Can I apply if my availability is set to Busy?',
          a: 'No, you cannot apply to jobs when your availability is set to Busy. Update your availability to "Open" to apply.',
        },
        {
          q: 'How does the matching algorithm work?',
          a: 'Jobs are scored based on skill match (60%), rate match (20%), availability (10%), and profile completion (10%). Higher scores mean better matches.',
        },
      ],
    },
    {
      category: 'For Recruiters',
      questions: [
        {
          q: 'What does "profile ready" mean?',
          a: 'A "ready" profile means the talent has completed at least 80% of their profile with all essential information validated. These candidates are more likely to be serious and prepared for work.',
        },
        {
          q: 'Can I filter by profile readiness?',
          a: 'Yes! In talent search, you can filter to show only ready profiles. This helps you focus on candidates who are prepared to start.',
        },
        {
          q: 'How do I post a job?',
          a: 'After registering as a recruiter, go to your dashboard and click "Post Job". Fill in the job details, required skills, budget, and publish.',
        },
        {
          q: 'Can I invite talent directly?',
          a: 'Yes, you can search for talent and send direct invites to your jobs. This is especially useful for finding specific skills.',
        },
      ],
    },
    {
      category: 'General',
      questions: [
        {
          q: 'Is Monera free?',
          a: 'For talent, we offer a free plan with basic features. Pro plans are available for enhanced features. Recruiters have paid plans starting at $49/month.',
        },
        {
          q: 'How do I get started?',
          a: 'Simply register with your role (Talent or Recruiter), complete your profile, and start exploring. Talent should aim for 80%+ profile completion to unlock best matches.',
        },
        {
          q: 'What makes Monera different from Upwork?',
          a: 'Monera focuses on quality-first matching. Only ready profiles can apply, reducing noise and improving match quality. Our profile readiness system ensures better outcomes.',
        },
        {
          q: 'Is there customer support?',
          a: 'Yes! We offer email support for all users. Contact us at monerabusiness.id@gmail.com. Priority support is available for Pro/Professional plan subscribers.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-brand-purple to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-purple-100">
              Everything you need to know about Monera
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, idx) => {
                  const globalIdx = catIdx * 100 + idx
                  const isOpen = openIndex === globalIdx
                  return (
                    <Card key={idx} className="border-2">
                      <CardHeader>
                        <Button
                          variant="ghost"
                          className="w-full text-left justify-between p-0 h-auto"
                          onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                        >
                          <CardTitle className="text-lg">{faq.q}</CardTitle>
                          <span className="text-2xl">{isOpen ? '−' : '+'}</span>
                        </Button>
                      </CardHeader>
                      {isOpen && (
                        <CardContent>
                          <p className="text-gray-600">{faq.a}</p>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gradient-to-r from-brand-purple to-indigo-700 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Still have questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">
                Can't find the answer you're looking for? We're here to help!
              </p>
              <a href="mailto:monerabusiness.id@gmail.com">
                <Button className="bg-white text-brand-purple hover:bg-gray-100">
                  Contact Us: monerabusiness.id@gmail.com
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
