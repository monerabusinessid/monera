'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/talent')) {
    return null
  }

  return (
    <footer className="bg-gray-800 text-gray-300 overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/footer-logo.png"
                alt="Monera Logo"
                width={150}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Build your dedicated remote team with Indonesia's top 5% talent. Fully managed HR & payroll.
            </p>
            <Link href="/register?role=CLIENT" className="inline-block mt-4">
              <button className="bg-brand-purple hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                Get Started →
              </button>
            </Link>
          </div>

          {/* For Talent */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">For Talent</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/register?role=TALENT" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Join as Talent
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">For Clients</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#services" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/register?role=CLIENT" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Hire Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about-us" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-brand-purple transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact & Newsletter Row */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-base">Get in Touch</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-start gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Jakarta, Indonesia</span>
                </p>
                <p className="flex items-start gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:monerabusiness.id@gmail.com" className="hover:text-brand-purple transition-colors break-all text-sm">
                    monerabusiness.id@gmail.com
                  </a>
                </p>
                <p className="flex items-start gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285161391439'}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-purple transition-colors text-sm">
                    WhatsApp Us
                  </a>
                </p>
              </div>
            </div>

            {/* Newsletter & Social */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-base">Stay Connected</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Get hiring tips & insights</p>
                  <form className="flex gap-2" onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value
                    try {
                      const res = await fetch('/api/newsletter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                      })
                      if (res.ok) {
                        alert('Successfully subscribed!')
                        form.reset()
                      } else {
                        alert('Failed to subscribe. Please try again.')
                      }
                    } catch (error) {
                      alert('Failed to subscribe. Please try again.')
                    }
                  }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email"
                      required
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand-purple"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Follow us</p>
                  <div className="flex gap-3">
                    <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/company/monera"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-purple transition-colors" aria-label="LinkedIn">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 23.2 0h.003z" />
                      </svg>
                    </a>
                    <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/monera.official"} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-purple transition-colors" aria-label="Instagram">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center lg:text-left">
              © {new Date().getFullYear()} Monera. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Secure Platform</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="whitespace-nowrap">GDPR Compliant</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-brand-purple transition-colors whitespace-nowrap">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-brand-purple transition-colors whitespace-nowrap">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
