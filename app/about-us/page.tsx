'use client'

import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950 text-white pt-20 pb-8 md:pt-24 md:pb-10 overflow-hidden" style={{ marginTop: '-80px' }}>
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
              About Monera
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-4 md:mb-6 leading-relaxed opacity-90 animate-slide-up">
              Connecting <span className="text-brand-yellow font-semibold">talent</span> with opportunity
            </p>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-t-3xl -mt-8 relative z-10">
        <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mission */}
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

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quality First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We prioritize quality over quantity. Every profile is vetted, every match is meaningful, 
                  and every connection is valuable.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe in clear communication, honest feedback, and transparent processes 
                  that build trust between talent and clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We continuously improve our platform with smart matching algorithms, 
                  user-friendly tools, and cutting-edge technology.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We foster a supportive community where professionals can grow, learn, 
                  and succeed together.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="bg-gradient-to-br from-brand-purple/10 to-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">📍 Our Office</h3>
                  <p className="text-gray-600">
                    Dubai, United Arab Emirates
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    We're based in Dubai, connecting talent and companies from around the world.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📧 Contact Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:monerabusiness.id@gmail.com" className="text-brand-purple hover:underline">
                      monerabusiness.id@gmail.com
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Send us a message</h3>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={4} placeholder="Your message..." />
                    </div>
                    <Button type="submit" className="bg-brand-purple hover:bg-purple-700">
                      Send Message
                    </Button>
                  </form>
                </div>
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
