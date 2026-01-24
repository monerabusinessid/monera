'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'

const menuItems = [
  { href: '/client', label: 'Dashboard', icon: '📊', description: 'Overview & stats' },
  { href: '/client/post-job', label: 'Post a Job', icon: '➕', description: 'Create new job' },
  { href: '/client/jobs', label: 'My Jobs', icon: '💼', description: 'Manage jobs' },
  { href: '/client/applications', label: 'Applications', icon: '📝', description: 'View applications' },
  { href: '/client/find-talent', label: 'Find Talent', icon: '🔍', description: 'Search candidates' },
  { href: '/client/request-talent', label: 'Request Talent', icon: '🎯', description: 'Submit request' },
  { href: '/client/talent-requests', label: 'My Requests', icon: '📋', description: 'Request status' },
]

export function ClientMenu() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/client') {
      return pathname === '/client'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <Card
                className={`
                  p-6 cursor-pointer transition-all duration-200 hover:shadow-lg
                  ${
                    active
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white hover:border-purple-300 hover:bg-purple-50'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-4xl">{item.icon}</span>
                  <div>
                    <h3
                      className={`
                        font-semibold text-lg mb-1
                        ${active ? 'text-white' : 'text-gray-900'}
                      `}
                    >
                      {item.label}
                    </h3>
                    <p
                      className={`
                        text-sm
                        ${active ? 'text-purple-100' : 'text-gray-500'}
                      `}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
