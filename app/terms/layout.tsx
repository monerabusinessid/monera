import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Monera',
  description: 'Read Monera\'s Terms of Service. Learn about user accounts, profile readiness requirements, and platform usage guidelines.',
  openGraph: {
    title: 'Terms of Service | Monera',
    description: 'Terms and conditions for using Monera platform.',
    type: 'website',
    url: '/terms',
  },
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
