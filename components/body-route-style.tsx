'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function BodyRouteStyle() {
  const pathname = usePathname()

  useEffect(() => {
    const body = document.body
    if (!body) return

    const isTalentShell =
      pathname?.startsWith('/talent') ||
      pathname?.startsWith('/client')

    body.classList.toggle('talent-shell', Boolean(isTalentShell))

    if (pathname?.startsWith('/talent')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [pathname])

  return null
}
