import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Monera',
  description: 'Learn how Monera collects, uses, and protects your personal information. Read our comprehensive privacy policy.',
  openGraph: {
    title: 'Privacy Policy | Monera',
    description: 'How we protect and use your data on Monera platform.',
    type: 'website',
    url: '/privacy',
  },
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
