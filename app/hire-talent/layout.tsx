import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hire Top Remote Talent | Build Your Team - Monera',
  description: 'Hire pre-vetted remote professionals in 48 hours. Top 5% talent, 60% cost savings, 30-day guarantee. Build your dedicated remote team today.',
  keywords: [
    'hire remote talent',
    'hire developers',
    'remote team',
    'hire freelancers',
    'remote hiring',
    'vetted talent',
    'hire professionals'
  ],
  openGraph: {
    title: 'Hire Top Remote Talent | Monera',
    description: 'Get 3 pre-vetted candidates in 48 hours. Save 60% on costs with our top 5% talent pool.',
    type: 'website',
    url: '/hire-talent',
  },
  alternates: {
    canonical: '/hire-talent',
  },
}

export default function HireTalentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
