import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Transparent All-Inclusive Packages | Monera',
  description: 'Transparent pricing for dedicated remote talent. All-inclusive packages from $750-$3,500/month. No hidden fees. Get your custom quote today.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
