import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Monera Login - Login to your monera account',
  description: 'Login to your Monera account to access your dashboard and manage your jobs',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
