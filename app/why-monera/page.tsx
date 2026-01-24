import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function WhyMoneraPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-brand-purple via-purple-700 to-indigo-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-4 font-headline">Why Choose Monera?</h1>
          <p className="text-xl text-purple-100">
            The platform that connects <span className="text-brand-yellow font-semibold">talent</span> with opportunity
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-lg">
                At Monera, we believe that great work happens when talented professionals 
                connect with the right opportunities. Our mission is to create a platform 
                that makes this connection seamless, fair, and rewarding for everyone.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-brand-yellow transition-colors">
              <CardHeader>
                <CardTitle className="font-headline">For Freelancers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-brand-purple">✓ Fair Opportunities</h3>
                  <p className="text-gray-600 text-sm">Access to quality projects with fair compensation.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-brand-purple">✓ Build Your Portfolio</h3>
                  <p className="text-gray-600 text-sm">Showcase your work and build your professional reputation.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-brand-purple">✓ Flexible Work</h3>
                  <p className="text-gray-600 text-sm">Work on your own terms, from anywhere in the world.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-brand-yellow transition-colors">
              <CardHeader>
                <CardTitle className="font-headline">For Clients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-brand-purple">✓ Top Talent</h3>
                  <p className="text-gray-600 text-sm">Access to verified professionals across all industries.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-brand-purple">✓ Secure Platform</h3>
                  <p className="text-gray-600 text-sm">Safe payments and project management tools.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-brand-purple">✓ Quality Guaranteed</h3>
                  <p className="text-gray-600 text-sm">Review portfolios and ratings before hiring.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center py-8 bg-gradient-to-br from-purple-50 to-yellow-50/30 rounded-lg p-8 border-2 border-purple-200/50 shadow-lg">
            <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Join Monera's Premium Freelance Marketplace?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Connect with quality remote professionals or find your next freelance opportunity
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register?role=TALENT" className="group">
                <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl">
                  Start as Freelancer →
                </Button>
              </Link>
              <Link href="/register?role=CLIENT" className="group">
                <Button size="lg" variant="outline" className="border-2 border-brand-purple text-brand-purple hover:bg-purple-50 font-semibold text-lg px-8 py-6 hover:scale-105 transition-all duration-300 rounded-xl">
                  Hire Remote Talent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
