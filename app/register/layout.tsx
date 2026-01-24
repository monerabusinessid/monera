import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign up for Monera | Client & Talent Account',
  description: 'Create your Monera account as a client or talent to start connecting with opportunities',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
