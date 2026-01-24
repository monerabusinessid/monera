'use client'

import { Footer } from '@/components/footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 bg-gradient-to-br from-brand-purple to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-purple-100">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg mx-auto">
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
      </section>

      <Footer />
    </div>
  )
}
