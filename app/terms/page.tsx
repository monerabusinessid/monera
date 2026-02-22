'use client'

import { Footer } from '@/components/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Terms of Service</h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Last updated: <span className="text-brand-yellow font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl space-y-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using Monera, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">2. Use License</h2>
            <p className="text-gray-700 mb-6">
              Permission is granted to temporarily use Monera for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">3. User Accounts</h2>
            <p className="text-gray-700 mb-6">
              You are responsible for maintaining the confidentiality of your account and password.
              You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">4. Profile Readiness</h2>
            <p className="text-gray-700 mb-6">
              Talent must achieve 80%+ profile completion to access best match jobs. This ensures
              quality matches and better outcomes for all users.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">5. Prohibited Uses</h2>
            <p className="text-gray-700 mb-6">
              You may not use Monera in any way that could damage, disable, overburden, or impair
              the service or interfere with any other party's use of the service.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">6. Disclaimer</h2>
            <p className="text-gray-700 mb-6">
              The materials on Monera are provided on an 'as is' basis. Monera makes no warranties,
              expressed or implied, and hereby disclaims and negates all other warranties.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">7. Limitations</h2>
            <p className="text-gray-700 mb-6">
              In no event shall Monera or its suppliers be liable for any damages arising out of
              the use or inability to use the materials on Monera.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">8. Revisions</h2>
            <p className="text-gray-700 mb-6">
              Monera may revise these terms of service at any time without notice. By using this
              website you are agreeing to be bound by the then current version of these terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">9. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:monerabusiness.id@gmail.com" className="text-brand-purple hover:underline">
                monerabusiness.id@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
