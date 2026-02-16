'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface ClientNavProps {
  userName: string
  userEmail?: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

interface MenuItem {
  href: string
  label: string
  description?: string
  icon?: React.ReactNode
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Jobs',
    items: [
      { 
        href: '/client/post-job', 
        label: 'Post a Job', 
        description: 'Create new job posting',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      },
      { 
        href: '/client/jobs', 
        label: 'My Jobs', 
        description: 'Manage your job postings',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      { 
        href: '/client/applications', 
        label: 'Applications', 
        description: 'View candidate applications',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
    ],
  },
  {
    label: 'Talent',
    items: [
      { 
        href: '/client/find-talent', 
        label: 'Talent', 
        description: 'Find freelancers and agencies',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      { 
        href: '/client/projects', 
        label: 'Projects', 
        description: 'See projects from other pros',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      },
    ],
  },
  {
    label: 'Reports',
    items: [
      { 
        href: '/client/reports/weekly', 
        label: 'Weekly Financial Summary', 
        description: 'View weekly spending and activity',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      },
      { 
        href: '/client/reports/transactions', 
        label: 'Transaction History', 
        description: 'View all transactions',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      { 
        href: '/client/reports/spending', 
        label: 'Spending by Activity', 
        description: 'Analyze spending patterns',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        )
      },
    ],
  },
]

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function ClientNav({ userName, userEmail }: ClientNavProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Check if click is inside any dropdown
      const clickedInsideDropdown = Object.values(dropdownRefs.current).some((ref) => {
        if (!ref) return false
        return ref.contains(target)
      })

      // Don't close if clicking on the button that opens it
      const button = target.closest('button[data-dropdown]')
      if (button) {
        return
      }

      // Close dropdown if clicking outside
      if (!clickedInsideDropdown && activeDropdown) {
        setActiveDropdown(null)
      }
    }

    if (activeDropdown || showUserMenu || showNotifications) {
      // Use a slight delay to allow link clicks to process first
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [activeDropdown, showUserMenu, showNotifications])

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
      // Direct redirect even on error
      window.location.href = '/login'
    }
  }

  const isActive = (href: string) => {
    if (href === '/client') {
      return pathname === '/client'
    }
    return pathname?.startsWith(href)
  }

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some((item) => isActive(item.href))
  }

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }


  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true)
      const response = await fetch('/api/notifications?unreadOnly=false&limit=20', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data.notifications || [])
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications()
    
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications, fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isRead: true }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
      setShowNotifications(false)
    }
  }

  return (
    <nav className="bg-white/80 backdrop-blur-lg sticky top-4 sm:top-6 rounded-2xl mx-3 sm:mx-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo, Search, and Navigation */}
          <div className="flex items-center space-x-4 flex-1">
            <Link href="/client" className="flex items-center flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Monera Logo"
                width={140}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation with Dropdowns */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Menu Groups with Dropdowns */}
              {menuGroups.map((group) => {
                const groupActive = isGroupActive(group)
                const dropdownOpen = activeDropdown === group.label

                return (
                  <div key={group.label} className="relative" ref={(el) => { dropdownRefs.current[group.label] = el }}>
                    <button
                      data-dropdown={group.label}
                      onClick={() => toggleDropdown(group.label)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1
                        ${groupActive || dropdownOpen ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}
                      `}
                    >
                      <span>{group.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200/80 py-2 z-50"
                      >
                        {group.items.map((item) => {
                          const itemActive = isActive(item.href)
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => {
                                setActiveDropdown(null)
                              }}
                              className={`
                                flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer
                                ${itemActive ? 'bg-purple-50 border-l-4 border-purple-600' : ''}
                              `}
                            >
                              {item.icon && (
                                <span className={`flex-shrink-0 ${itemActive ? 'text-purple-600' : 'text-gray-600'}`}>
                                  {item.icon}
                                </span>
                              )}
                              <div className="flex-1">
                                <div className={`font-medium ${itemActive ? 'text-purple-600' : 'text-gray-900'}`}>
                                  {item.label}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Messages Link - After Reports */}
              <Link
                href="/client/messages"
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive('/client/messages') ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}
                `}
              >
                Messages
              </Link>
            </div>
          </div>

          {/* Icons and User Menu */}
          <div className="flex items-center space-x-2">
            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Help Icon */}
              <Link
                href="/client/help"
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                title="Help"
                aria-label="Help"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* Notifications Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Notification Badge */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200/80 py-2 z-20 max-h-[500px] overflow-y-auto">
                      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        )}
                      </div>
                      {loadingNotifications ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          Loading...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`
                                w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                                ${!notification.is_read ? 'bg-blue-50' : ''}
                              `}
                            >
                              <div className="flex items-start space-x-3">
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="relative" ref={(el) => { dropdownRefs.current['user'] = el }}>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu)
                    setActiveDropdown(null)
                    setShowNotifications(false)
                  }}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  data-dropdown="user"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur rounded-lg shadow-lg border border-gray-200/80 py-1 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      </div>
                      <Link
                        href="/client/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Account Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-200/80 bg-white/95 backdrop-blur">
          <div className="px-4 py-3 space-y-1">
            <div className="pt-2 border-b border-gray-200 pb-3 mb-3">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>

            {/* Messages */}
            <Link
              href="/client/messages"
              onClick={() => setShowMobileMenu(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/client/messages') ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Messages
            </Link>

            {/* Menu Groups */}
            {menuGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon && (
                      <span className={`flex-shrink-0 ${isActive(item.href) ? 'text-purple-600' : 'text-gray-600'}`}>
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200 mt-2 space-y-1">
              <Link
                href="/client/settings"
                onClick={() => setShowMobileMenu(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
              >
                <span>⚙️</span>
                <span>Account Settings</span>
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  handleLogout()
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 flex items-center space-x-3"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
