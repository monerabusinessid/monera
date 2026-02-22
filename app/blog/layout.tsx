import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Remote Work Insights & Tips - Monera',
  description: 'Read the latest insights, tips, and stories about remote work, hiring, and career development. Expert advice for talents and companies.',
  keywords: [
    'remote work blog',
    'hiring tips',
    'career advice',
    'freelancing tips',
    'remote team management',
    'developer career'
  ],
  openGraph: {
    title: 'Monera Blog | Remote Work Insights',
    description: 'Expert insights on remote work, hiring, and career development.',
    type: 'website',
    url: '/blog',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
