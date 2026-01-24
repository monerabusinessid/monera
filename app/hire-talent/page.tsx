import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function HireTalentPage() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950 text-white pt-40 sm:pt-36 pb-12 md:pb-16 overflow-hidden -mt-20 sm:-mt-24">
        {/* Animated Background - Enhanced Stars/Particles */}
        <div className="absolute inset-0 overflow-hidden -top-20 md:-top-24">
          {/* Enhanced animated stars/particles */}
          <div className="absolute inset-0">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${Math.random() * 4 + 2}s`,
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Large animated bubbles */}
          <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-brand-yellow/40 via-purple-400/30 to-indigo-400/30 rounded-full blur-3xl animate-float-slow opacity-80"></div>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-brand-yellow/30 rounded-full blur-3xl animate-float-reverse opacity-70"></div>
          
          {/* Enhanced Medium floating bubbles */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/25 to-indigo-400/25 rounded-full blur-2xl animate-float-medium opacity-60"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-yellow/25 to-purple-400/25 rounded-full blur-2xl animate-float-slow opacity-50"></div>
          
          {/* Enhanced Small floating particles */}
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-float-fast opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl animate-float-medium opacity-60"></div>
          
          {/* Additional pulsing glow effects */}
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse-slow transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 pt-2">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 font-headline leading-[1.1] tracking-tight animate-fade-in">
              Hire Top Talent
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-6 md:mb-8 leading-relaxed opacity-90 animate-slide-up">
              Find the perfect <span className="text-brand-yellow font-semibold">talent</span> for your project
            </p>
            <Link href="/register?role=CLIENT">
              <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-semibold shadow-lg mb-6">
                Post a Job - It's Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-t-3xl -mt-6 sm:-mt-8 relative z-10">
        <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-brand-yellow transition-colors">
            <CardHeader>
              <div className="text-4xl mb-4">📝</div>
              <CardTitle className="font-headline">Post Your Job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Describe your project and requirements. It only takes a few minutes.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-brand-yellow transition-colors">
            <CardHeader>
              <div className="text-4xl mb-4">👥</div>
              <CardTitle className="font-headline">Get Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive proposals from qualified freelancers ready to work on your project.
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-brand-yellow transition-colors">
            <CardHeader>
              <div className="text-4xl mb-4">✅</div>
              <CardTitle className="font-headline">Hire & Collaborate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Choose the best match and work together through our secure platform.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-gradient-to-br from-purple-50 to-yellow-50/30 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4 font-headline">Why Hire on Monera?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2 text-brand-purple">✓ Verified Professionals</h3>
              <p className="text-gray-600">All freelancers are verified and have completed profiles.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2 text-brand-purple">✓ Secure Payments</h3>
              <p className="text-gray-600">Pay securely through our platform with money-back guarantee.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2 text-brand-purple">✓ Quality Work</h3>
              <p className="text-gray-600">Review portfolios and ratings before hiring.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2 text-brand-purple">✓ 24/7 Support</h3>
              <p className="text-gray-600">Get help whenever you need it from our support team.</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
