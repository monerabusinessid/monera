import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function HireFreelancerPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-brand-purple to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Hire Top Freelancers</h1>
          <p className="text-xl mb-8 text-purple-100">
            Find the perfect talent for your project
          </p>
          <Link href="/register?role=RECRUITER">
            <Button size="lg" className="bg-white text-brand-purple hover:bg-purple-50">
              Post a Job - It's Free
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">📝</div>
              <CardTitle>Post Your Job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Describe your project and requirements. It only takes a few minutes.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">👥</div>
              <CardTitle>Get Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive proposals from qualified freelancers ready to work on your project.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="text-4xl mb-4">✅</div>
              <CardTitle>Hire & Collaborate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Choose the best match and work together through our secure platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Hire on Monera?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2">✓ Verified Professionals</h3>
              <p className="text-gray-600">All freelancers are verified and have completed profiles.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2">✓ Secure Payments</h3>
              <p className="text-gray-600">Pay securely through our platform with money-back guarantee.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2">✓ Quality Work</h3>
              <p className="text-gray-600">Review portfolios and ratings before hiring.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2">✓ 24/7 Support</h3>
              <p className="text-gray-600">Get help whenever you need it from our support team.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
