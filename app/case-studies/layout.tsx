import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Success Stories - Real Results from Real Companies | Monera',
  description: 'See how companies save up to 75% on costs with Monera. Real case studies from Singapore, Australia, and US companies building remote teams.',
}

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
