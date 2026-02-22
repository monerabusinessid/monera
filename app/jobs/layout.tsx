import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Remote Jobs | Quality Job Opportunities - Monera',
  description: 'Discover quality remote job opportunities from top companies. Browse vetted positions, apply with confidence, and advance your career with Monera.',
  keywords: [
    'remote jobs',
    'work from home',
    'remote work opportunities',
    'online jobs',
    'freelance jobs',
    'remote positions',
    'job search',
    'career opportunities'
  ],
  openGraph: {
    title: 'Find Your Dream Remote Job | Monera',
    description: 'Browse quality remote job opportunities from vetted companies. Start your remote career today.',
    type: 'website',
    url: '/jobs',
  },
  alternates: {
    canonical: '/jobs',
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
