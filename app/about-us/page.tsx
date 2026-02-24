'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AboutUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const customIcons = {
    target: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#FFC107" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" stroke="#FFC107" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="#FFC107"/>
      </svg>
    ),
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const subject = `Message from ${formData.name || 'Website visitor'}`
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    const mailto = `mailto:business@monera.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              About Monera
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Global Standards. <span className="text-brand-yellow">Indonesian Talent.</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Vision */}
          <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-9 h-9">{customIcons.target}</div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision</h2>
                <p className="text-2xl font-bold text-brand-yellow mb-4">
                  To make Indonesian talent the global gold standard: competent, dedicated, and trusted.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Monera is a strategic partner for global businesses seeking to build high-quality remote teams. 
                  Unlike traditional freelancer platforms, we provide full-time dedicated talent drawn from the top 5% 
                  of Indonesia's workforce. We handle the entire process—recruitment, legal compliance, payroll, and 
                  HR management—so you can focus on growing your business with significantly lower operational costs.
                </p>
              </div>
            </div>
          </div>

          {/* Our Team */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Meet The Team</h2>
              <p className="text-xl text-gray-600 mt-4">The people behind Monera</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-4 border-brand-purple/30 hover:shadow-2xl hover:border-brand-purple transition-all">
                <h3 className="text-2xl font-bold mb-2">Muh Khaidir Alfikri</h3>
                <p className="text-brand-purple font-bold mb-4">CEO & Co-Founder</p>
                <p className="text-gray-700 leading-relaxed">
                  With a strong background in business strategy and client acquisition, Fikri leads Monera's vision and growth. 
                  He ensures that every client partnership delivers exceptional value and that our operational engine runs smoothly.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-4 border-brand-purple/30 hover:shadow-2xl hover:border-brand-purple transition-all">
                <h3 className="text-2xl font-bold mb-2">Arief Ockta Yoeseva</h3>
                <p className="text-brand-purple font-bold mb-4">CTO & Co-Founder</p>
                <p className="text-gray-700 leading-relaxed">
                  Arief brings deep technical expertise in product development and AI integration. 
                  He oversees the Monera platform, ensuring secure, reliable, and innovative technology that scales with our clients' needs.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
              <p className="text-xl text-purple-100">We'd love to hear from you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-colors">
                <h3 className="font-bold mb-2 text-lg">Headquarters</h3>
                <p className="text-purple-100">Jakarta, Indonesia</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-colors">
                <h3 className="font-bold mb-2 text-lg">Email</h3>
                <a href="mailto:info@monera.work" className="text-brand-yellow hover:underline font-semibold">
                  info@monera.work
                </a>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center hover:bg-white/20 transition-colors">
                <h3 className="font-bold mb-2 text-lg">WhatsApp</h3>
                <a href="https://wa.me/6285161391439" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:underline font-semibold">
                  +62 851-6139-1439
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="name" className="text-gray-900">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    required
                    className="border-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    required
                    className="border-2"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-gray-900">Message</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                    required
                    className="border-2"
                  />
                </div>
                <Button type="submit" className="w-full bg-brand-purple hover:bg-purple-700 text-white font-bold py-6 text-lg">
                  Send Message
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
