'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show Navbar on admin pages (they have their own AdminNav)
  // Don't show Navbar on client pages (they have their own ClientNav)
  // Don't show Navbar on user/talent pages (they have their own nav in layout)
  // Don't show Navbar on login/register pages (clean login experience)
  if (
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/client') ||
    pathname?.startsWith('/user') ||
    pathname?.startsWith('/talent/onboarding') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/verify-email')
  ) {
    return null
  }
  
  // Always show navbar on other pages
  return <Navbar />
}
