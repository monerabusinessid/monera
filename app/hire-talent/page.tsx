import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function HireTalentPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Hire Top Talent</h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Find the <span className="text-brand-yellow font-semibold">perfect talent</span> for your project
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="max-w-6xl mx-auto space-y-16">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-brand-purple/30">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-purple mb-1">48hrs</div>
            <div className="text-sm text-gray-600">Get Candidates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-purple mb-1">60%</div>
            <div className="text-sm text-gray-600">Cost Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-purple mb-1">Top 5%</div>
            <div className="text-sm text-gray-600">Vetted Talent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-purple mb-1">30-Day</div>
            <div className="text-sm text-gray-600">Guarantee</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-4 border-brand-purple/30 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Post Your Job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Describe your project and requirements. It only takes a few minutes.
              </p>
            </CardContent>
          </Card>
          <Card className="border-4 border-brand-purple/30 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Get Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Receive proposals from qualified freelancers ready to work on your project.
              </p>
            </CardContent>
          </Card>
          <Card className="border-4 border-brand-purple/30 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Hire & Collaborate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Choose the best match and work together through our secure platform.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Hire Top Talent?</h2>
            <p className="text-purple-100 mb-6 text-lg">Post your first job for free and start receiving proposals today</p>
            <Link href="/register?role=CLIENT">
              <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold shadow-lg px-8 py-6 text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
