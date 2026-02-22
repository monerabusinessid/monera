'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How does Monera work?',
          a: 'Monera connects you with top 5% Indonesian talent for full-time dedicated roles. We handle recruitment, HR, payroll, and compliance. You get 3 pre-vetted candidates in 48 hours, interview them, and we manage everything else.',
        },
        {
          q: 'What makes Monera different from freelance platforms?',
          a: 'Unlike Upwork or Fiverr, we provide full-time dedicated team members, not freelancers. We handle all HR, payroll, taxes, and benefits. You get committed professionals who work exclusively for you.',
        },
        {
          q: 'How quickly can I hire someone?',
          a: 'You receive 3 pre-vetted candidates within 48 hours of your consultation. After interviews, onboarding typically takes 3-5 days. Most clients have their team member working within one week.',
        },
        {
          q: 'What is the 30-day replacement guarantee?',
          a: 'If you\'re not satisfied with your hire within the first 30 days, we\'ll find you a replacement at no additional cost. We work quickly to minimize disruption to your business.',
        },
      ],
    },
    {
      category: 'Pricing & Costs',
      questions: [
        {
          q: 'What is included in the pricing?',
          a: 'All-inclusive pricing covers: full salary, local taxes, health insurance, statutory benefits, HR management, payroll processing, legal compliance, and platform access. No hidden fees.',
        },
        {
          q: 'How much can I save compared to local hiring?',
          a: 'Most clients save 50-70% compared to hiring locally in Singapore, Australia, or the US. For example, a customer support role that costs $3,500/month locally costs around $850/month with Monera.',
        },
        {
          q: 'Are there any setup fees?',
          a: 'No setup fees, no contracts, no hidden costs. You only pay the monthly all-inclusive rate for your team member.',
        },
        {
          q: 'Can I cancel anytime?',
          a: 'Yes, there are no long-term contracts. You can scale up or down as needed. We recommend giving 30 days notice for smooth transitions.',
        },
      ],
    },
    {
      category: 'Talent Quality',
      questions: [
        {
          q: 'How do you vet talent?',
          a: 'We have a rigorous 5-stage vetting process: application screening, skills assessment, portfolio review, video interview, and reference checks. Only the top 5% of applicants make it through.',
        },
        {
          q: 'What roles can I hire for?',
          a: 'We cover three main categories: Operational Excellence (admin, customer support), Growth & Creative (social media, design, video editing), and Technical & Specialized (developers, QA, UI/UX, accounting).',
        },
        {
          q: 'Do they speak English?',
          a: 'Yes, all our talent are fluent in English. Communication skills are a key part of our vetting process.',
        },
        {
          q: 'What if the person doesn\'t work out?',
          a: 'Our 30-day replacement guarantee covers this. We\'ll find you a better match at no additional cost.',
        },
      ],
    },
    {
      category: 'Management & Operations',
      questions: [
        {
          q: 'How do I manage my remote team member?',
          a: 'You manage them directly using your preferred tools (Slack, Zoom, Asana, etc.). They work during your business hours and integrate seamlessly with your team.',
        },
        {
          q: 'What about HR and payroll?',
          a: 'We handle everything: contracts, monthly payroll, taxes, benefits, compliance, and HR administration. You focus on managing their work, we handle the rest.',
        },
        {
          q: 'Can they work in my timezone?',
          a: 'Yes, our talent are flexible and can work in your timezone. Indonesia is GMT+7, which overlaps well with Asia-Pacific and can accommodate US/EU hours.',
        },
        {
          q: 'What equipment do they need?',
          a: 'Team members provide their own computer and internet. If you need specific equipment or software, we can coordinate that as part of onboarding.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about building your remote team
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-16 bg-white -mt-20 relative z-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-brand-purple">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, idx) => {
                  const globalIdx = catIdx * 100 + idx
                  const isOpen = openIndex === globalIdx
                  return (
                    <Card key={idx} className="border-2 border-gray-200 hover:border-brand-purple transition-all rounded-2xl">
                      <CardHeader>
                        <Button
                          variant="ghost"
                          className="w-full text-left justify-between p-0 h-auto hover:bg-transparent"
                          onClick={() => setOpenIndex(isOpen ? null : globalIdx)}
                        >
                          <CardTitle className="text-lg font-bold text-gray-900">{faq.q}</CardTitle>
                          <span className={`text-brand-purple text-2xl font-bold transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                            +
                          </span>
                        </Button>
                      </CardHeader>
                      {isOpen && (
                        <CardContent className="pt-0">
                          <p className="text-gray-600 leading-relaxed">{faq.a}</p>
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

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gradient-to-r from-brand-purple to-purple-700 text-white border-0 rounded-3xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">Still have questions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-6 text-lg">
                Can't find the answer you're looking for? Book a free consultation with our team.
              </p>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285161391439'}?text=Hi%20Monera,%20I%20have%20questions%20about%20hiring%20remote%20talent`} target="_blank" rel="noopener noreferrer">
                <Button className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold px-8 py-6 text-lg">
                  Contact Us on WhatsApp
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
