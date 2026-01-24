'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getAdminCapabilities } from '@/lib/admin/rbac'
import type { AdminRole } from '@/lib/admin/rbac'
import { createClient } from '@/lib/supabase/client'

interface AdminNavProps {
  userRole: AdminRole | string
  userEmail?: string
}

export function AdminNav({ userRole, userEmail }: AdminNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({})
  const pathname = usePathname()
  const router = useRouter()
  const capabilities = getAdminCapabilities(userRole)

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      // Direct redirect to login (no navbar will show)
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
      router.push('/login')
    }
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  ]

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-3' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <Link href="/admin/dashboard" className="flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Monera Logo"
                width={180}
                height={60}
                className="h-14 w-auto object-contain"
                priority
              />
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{userRole}</p>
            </div>
            {userEmail && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-xs text-gray-600 truncate mt-1">{userEmail}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className="block"
            >
              <div
                className={`
                  flex items-center rounded-lg transition-colors group relative
                  ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                  ${
                    isActive
                      ? 'bg-brand-purple text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}

        {/* Account Dropdown */}
        {(capabilities.canManageAdmins || capabilities.canReviewTalent) && (
          <div className="space-y-1">
            <button
              onClick={() => toggleDropdown('account')}
              className={`
                w-full flex items-center justify-between rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname.startsWith('/admin/users')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg flex-shrink-0">👥</span>
                {!isCollapsed && <span className="font-medium">Account</span>}
              </div>
              {!isCollapsed && (
                <svg
                  className={`w-4 h-4 transition-transform ${openDropdowns.account ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {!isCollapsed && openDropdowns.account && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                <Link
                  href="/admin/users"
                  className={`
                    flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                    ${pathname === '/admin/users' ? 'bg-brand-purple/10 text-brand-purple font-medium' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <span className="text-sm">👨‍💼</span>
                  <span className="text-sm">Admin User</span>
                </Link>
                {capabilities.canReviewTalent && (
                  <>
                    <Link
                      href="/admin/users/talents"
                      className={`
                        flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                        ${pathname === '/admin/users/talents' ? 'bg-brand-purple/10 text-brand-purple font-medium' : 'text-gray-600 hover:bg-gray-50'}
                      `}
                    >
                      <span className="text-sm">⭐</span>
                      <span className="text-sm">Talent User</span>
                    </Link>
                    <Link
                      href="/admin/users/clients"
                      className={`
                        flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                        ${pathname === '/admin/users/clients' ? 'bg-brand-purple/10 text-brand-purple font-medium' : 'text-gray-600 hover:bg-gray-50'}
                      `}
                    >
                      <span className="text-sm">🏢</span>
                      <span className="text-sm">Client User</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Talent Dropdown */}
        {(capabilities.canReviewTalent || true) && (
          <div className="space-y-1">
            <button
              onClick={() => toggleDropdown('talent')}
              className={`
                w-full flex items-center justify-between rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname.startsWith('/admin/talent-review') || pathname.startsWith('/admin/talent-requests')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg flex-shrink-0">⭐</span>
                {!isCollapsed && <span className="font-medium">Talent</span>}
              </div>
              {!isCollapsed && (
                <svg
                  className={`w-4 h-4 transition-transform ${openDropdowns.talent ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            {!isCollapsed && openDropdowns.talent && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                <Link
                  href="/admin/talent-review"
                  className={`
                    flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                    ${pathname === '/admin/talent-review' ? 'bg-brand-purple/10 text-brand-purple font-medium' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <span className="text-sm">⭐</span>
                  <span className="text-sm">Talent Review</span>
                </Link>
                <Link
                  href="/admin/talent-requests"
                  className={`
                    flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors
                    ${pathname === '/admin/talent-requests' ? 'bg-brand-purple/10 text-brand-purple font-medium' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <span className="text-sm">🎯</span>
                  <span className="text-sm">Talent Request</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Jobs */}
        {capabilities.canReviewJobs && (
          <Link
            href="/admin/jobs"
            title={isCollapsed ? 'Jobs' : undefined}
            className="block"
          >
            <div
              className={`
                flex items-center rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname === '/admin/jobs' || pathname.startsWith('/admin/jobs/')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">💼</span>
              {!isCollapsed && <span className="font-medium">Jobs</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Jobs
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Applications */}
        <Link
          href="/admin/applications"
          title={isCollapsed ? 'Applications' : undefined}
          className="block"
        >
          <div
            className={`
              flex items-center rounded-lg transition-colors group relative
              ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              ${
                pathname === '/admin/applications' || pathname.startsWith('/admin/applications/')
                  ? 'bg-brand-purple text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">📝</span>
            {!isCollapsed && <span className="font-medium">Applications</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Applications
              </div>
            )}
          </div>
        </Link>

        {/* Skills */}
        {capabilities.canReviewTalent && (
          <Link
            href="/admin/skills"
            title={isCollapsed ? 'Skills' : undefined}
            className="block"
          >
            <div
              className={`
                flex items-center rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname === '/admin/skills' || pathname.startsWith('/admin/skills/')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">🔧</span>
              {!isCollapsed && <span className="font-medium">Skills</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Skills
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Analytics */}
        {capabilities.canViewAnalytics && (
          <Link
            href="/admin/analytics"
            title={isCollapsed ? 'Analytics' : undefined}
            className="block"
          >
            <div
              className={`
                flex items-center rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname === '/admin/analytics' || pathname.startsWith('/admin/analytics/')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">📈</span>
              {!isCollapsed && <span className="font-medium">Analytics</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Analytics
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Audit Logs */}
        {capabilities.canViewAuditLog && (
          <Link
            href="/admin/audit-logs"
            title={isCollapsed ? 'Audit Logs' : undefined}
            className="block"
          >
            <div
              className={`
                flex items-center rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname === '/admin/audit-logs' || pathname.startsWith('/admin/audit-logs/')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">📋</span>
              {!isCollapsed && <span className="font-medium">Audit Logs</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Audit Logs
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Settings */}
        {capabilities.canManageSettings && (
          <Link
            href="/admin/settings"
            title={isCollapsed ? 'Settings' : undefined}
            className="block"
          >
            <div
              className={`
                flex items-center rounded-lg transition-colors group relative
                ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${
                  pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')
                    ? 'bg-brand-purple text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg flex-shrink-0">⚙️</span>
              {!isCollapsed && <span className="font-medium">Settings</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  Settings
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Landing Page */}
        <Link
          href="/admin/landing-page"
          title={isCollapsed ? 'Landing Page' : undefined}
          className="block"
        >
          <div
            className={`
              flex items-center rounded-lg transition-colors group relative
              ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              ${
                pathname === '/admin/landing-page' || pathname.startsWith('/admin/landing-page/')
                  ? 'bg-brand-purple text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">🌐</span>
            {!isCollapsed && <span className="font-medium">Landing Page</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Landing Page
              </div>
            )}
          </div>
        </Link>

        {/* Test Roles */}
        <Link
          href="/admin/test-roles"
          title={isCollapsed ? 'Test Roles' : undefined}
          className="block"
        >
          <div
            className={`
              flex items-center rounded-lg transition-colors group relative
              ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              ${
                pathname === '/admin/test-roles' || pathname.startsWith('/admin/test-roles/')
                  ? 'bg-brand-purple text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-lg flex-shrink-0">🧪</span>
            {!isCollapsed && <span className="font-medium">Test Roles</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Test Roles
              </div>
            )}
          </div>
        </Link>
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-gray-200 space-y-2 ${isCollapsed ? 'px-3' : ''}`}>
        <Link href="/" title={isCollapsed ? 'Back to Site' : undefined}>
          <Button
            variant="outline"
            className={`w-full ${isCollapsed ? 'px-2' : ''}`}
          >
            {isCollapsed ? (
              <span className="text-lg">🏠</span>
            ) : (
              <span>🏠 Back to Site</span>
            )}
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? 'px-2' : ''}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          {isCollapsed ? (
            <span className="text-lg">🚪</span>
          ) : (
            <span>🚪 Logout</span>
          )}
        </Button>
      </div>
    </aside>
  )
}
