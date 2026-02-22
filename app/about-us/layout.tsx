import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Global Standards, Indonesian Talent | Monera',
  description: 'Learn about Monera. We connect global businesses with Indonesia\'s top 5% talent. Meet our team and discover our vision.',
}

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
