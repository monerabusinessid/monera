import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function WhatsNewPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
              What's New at Monera
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-6 md:mb-8 leading-relaxed opacity-90 animate-slide-up">
              Stay updated with our latest features, updates, and improvements
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-t-3xl -mt-6 sm:-mt-8 relative z-10">
        <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Latest Updates */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Latest Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Enhanced Job Search</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">January 2026</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We've improved our job search functionality with better filters and faster results. 
                    Find the perfect job that matches your skills and preferences.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">New Admin Dashboard</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">January 2026</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Introducing a comprehensive admin dashboard with advanced analytics, 
                    user management, and job moderation tools.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Improved Profile System</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">December 2025</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Enhanced profile features with better portfolio showcase, 
                    skill verification, and profile completion tracking.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Real-time Notifications</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">December 2025</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get instant notifications for job applications, messages, 
                    and important updates directly in your dashboard.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Mobile App Updates</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">November 2025</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Improved mobile experience with faster load times, 
                    better navigation, and enhanced job browsing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Security Enhancements</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">November 2025</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Enhanced security measures to protect your data and ensure 
                    a safe platform for all users.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/news">
                <CardHeader>
                  <CardTitle className="text-lg">Monera Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Check out our latest products, partners, and enhancements.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/news">
                <CardHeader>
                  <CardTitle className="text-lg">Blog</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    News and stories from the world's work marketplace.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/news">
                <CardHeader>
                  <CardTitle className="text-lg">Research Institute</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Insights and tools for business leaders navigating a new world of work.
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/news">
                <CardHeader>
                  <CardTitle className="text-lg">Release Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Our latest product news, additions, and improvements.
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Newsletter Signup */}
          <Card className="bg-gradient-to-br from-purple-50 to-yellow-50/50 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Subscribe to our newsletter to receive the latest updates, tips, and exclusive content.
              </p>
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
                <button className="px-6 py-2 bg-brand-yellow text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors font-semibold shadow-md">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
