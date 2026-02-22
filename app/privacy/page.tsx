'use client'

import { Footer } from '@/components/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Privacy Policy</h1>
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
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-6">
              We collect information that you provide directly to us, including profile information,
              skills, experience, portfolio links, and communication preferences.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-6">
              We use the information we collect to provide, maintain, and improve our services,
              including matching talent with jobs, validating profile readiness, and facilitating
              communication between users.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">3. Profile Readiness Data</h2>
            <p className="text-gray-700 mb-6">
              We calculate and store profile readiness scores to ensure quality matches. This data
              is visible to recruiters to help them find suitable candidates.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">4. Information Sharing</h2>
            <p className="text-gray-700 mb-6">
              We share your profile information with recruiters when you apply to jobs or when they
              search for talent. We do not sell your personal information to third parties.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">5. Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">6. Your Rights</h2>
            <p className="text-gray-700 mb-6">
              You have the right to access, update, or delete your personal information at any time
              through your account settings.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">7. Cookies</h2>
            <p className="text-gray-700 mb-6">
              We use cookies to maintain your session and improve your experience. You can control
              cookies through your browser settings.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">8. Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions about this Privacy Policy, please contact us at{' '}
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
