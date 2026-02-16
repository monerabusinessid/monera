import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export function Logo({ className = '', size = 'md', href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  }

  const imageSizes = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 },
    lg: { width: 180, height: 60 },
  }

  const dim = imageSizes[size]

  return (
    <Link href={href} className={`flex items-center ${className}`}>
      <Image
        src="/images/logo.png"
        alt="Monera Logo"
        width={dim.width}
        height={dim.height}
        className={`${sizeClasses[size]} w-auto object-contain`}
        priority
      />
    </Link>
  )
}
