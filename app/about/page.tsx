'use client'

import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-brand-purple to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About Monera</h1>
            <p className="text-xl text-purple-100">
              Quality-first talent marketplace
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              Monera is a quality-first talent marketplace that connects vetted remote talent with
              quality-focused companies. We believe that better matching leads to better outcomes
              for everyone.
            </p>

            <h2 className="text-3xl font-bold mb-6 mt-12">What Makes Us Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Readiness System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Every talent profile is validated before work begins. Only ready profiles can
                    apply to jobs, ensuring quality matches.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Smart Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    AI-powered matching based on skills, rate, availability, and profile
                    completeness. Better matches, better outcomes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quality Over Quantity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We focus on quality connections rather than volume. Less noise, more signal.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Remote-First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Built for remote work from the ground up. Connect with talent and companies
                    anywhere in the world.
                  </p>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-3xl font-bold mb-6 mt-12">Our Story</h2>
            <p className="text-gray-700 mb-6">
              Monera was founded with a simple idea: what if we could create a talent marketplace
              where quality comes first? Where talent only applies when they're ready, and
              recruiters only see candidates who are validated?
            </p>
            <p className="text-gray-700 mb-6">
              Today, we're building that vision. With our profile readiness system, smart matching
              algorithm, and quality-first approach, we're helping thousands of talent and
              companies find better matches, faster.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
