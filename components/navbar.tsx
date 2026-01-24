'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const { user: authContextUser, logout, loading: authLoading } = useAuth()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [supabaseProfile, setSupabaseProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const lastScrollYRef = useRef(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Check Supabase session for admin users
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        // If there's an error or no user, clear state
        if (error || !user) {
          setSupabaseUser(null)
          setSupabaseProfile(null)
          setLoading(false)
          return
        }
        
        // User exists, fetch profile
        setSupabaseUser(user)
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile && !profileError) {
            setSupabaseProfile(profile)
          } else {
            // Profile not found, clear user
            setSupabaseUser(null)
            setSupabaseProfile(null)
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError)
          setSupabaseUser(null)
          setSupabaseProfile(null)
        }
      } catch (error) {
        console.error('Error checking Supabase session:', error)
        // Clear state on error
        setSupabaseUser(null)
        setSupabaseProfile(null)
      } finally {
        setLoading(false)
      }
    }

    checkSupabaseSession()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const supabase = createClient()
    const authStateChangeResult = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        // Fetch profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error: profileError }) => {
            if (profile && !profileError) {
              setSupabaseProfile(profile)
            } else {
              if (profileError) {
                console.error('Error fetching profile on auth change:', profileError)
              }
              setSupabaseUser(null)
              setSupabaseProfile(null)
            }
          })
      } else {
        // Session is null, clear everything
        setSupabaseUser(null)
        setSupabaseProfile(null)
      }
      setLoading(false)
    })

    return () => {
      if (authStateChangeResult?.data?.subscription) {
        authStateChangeResult.data.subscription.unsubscribe()
      }
    }
  }, [])

  // Refresh session check when page becomes visible (handles back button case)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-check session when page becomes visible
        const checkSession = async () => {
          try {
            const supabase = createClient()
            const { data: { user }, error } = await supabase.auth.getUser()
            
            if (error || !user) {
              setSupabaseUser(null)
              setSupabaseProfile(null)
            } else {
              // Verify user still exists
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
              
              if (profile && !profileError) {
                setSupabaseUser(user)
                setSupabaseProfile(profile)
              } else {
                setSupabaseUser(null)
                setSupabaseProfile(null)
              }
            }
          } catch (error) {
            console.error('Error re-checking session:', error)
            setSupabaseUser(null)
            setSupabaseProfile(null)
          }
        }
        checkSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const lastScrollY = lastScrollYRef.current
      
      setIsScrolled(currentScrollY > 100)

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up')
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown === 'profile' || activeDropdown === 'profile-minimal') {
        const profileRef = dropdownRefs.current[activeDropdown]
        if (profileRef && !profileRef.contains(event.target as Node)) {
          setActiveDropdown(null)
        }
      }
    }

    if (activeDropdown === 'profile' || activeDropdown === 'profile-minimal') {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeDropdown])

  // Close menu when scrolling down
  useEffect(() => {
    if (isScrolled && scrollDirection === 'down') {
      setShowMobileMenu(false)
    }
  }, [isScrolled, scrollDirection])

  // Helper functions
  const handleMouseEnter = (menu: string) => {
    setActiveDropdown(menu)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  // Use Supabase user if available (for admin), otherwise use auth context user
  // But only if both user and profile exist
  let user: any = null
  if (supabaseUser && supabaseProfile) {
    user = {
      id: supabaseUser.id,
      email: supabaseUser.email || supabaseProfile.email || '',
      role: supabaseProfile.role || 'CANDIDATE',
      fullName: supabaseProfile.full_name || null,
    }
  } else {
    user = authContextUser || null
  }

  const isLoading = loading || authLoading;
  const showFullNavbar = scrollDirection === 'up' || !isScrolled;

  return (
    <>
      {/* Full Navbar - Shows when scrolling up or at top */}
      <nav className={`hidden lg:block bg-white/80 backdrop-blur-lg sticky top-2 sm:top-4 z-50 transition-all duration-300 rounded-2xl shadow-lg mx-3 sm:mx-4 ${showFullNavbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Burger Menu for Mobile */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-50 relative"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center flex-1 min-w-0">
              {/* Logo - Left */}
              <div className="flex-shrink-0">
                <Logo />
              </div>
              
              {/* Menu - Center */}
              <div className="hidden lg:flex items-center justify-center space-x-6 flex-1">
                {/* Show menu only when not loading */}
                {!isLoading && (
                  <>
                    {/* Find Jobs Link - Show for non-users and TALENT users */}
                    {(!user || user.role === 'TALENT') && (
                      <Link 
                        href={user?.role === 'TALENT' ? "/talent/jobs" : "/jobs"} 
                        className="text-base text-gray-900 hover:text-brand-purple transition-colors font-medium"
                      >
                        Find Jobs
                      </Link>
                    )}

                    {/* Hire Talent Link - Show for non-users, clients, and admins */}
                    {(!user || user.role === 'CLIENT' || (user.role && ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(user.role))) && (
                      <Link
                        href="/hire-talent"
                        className="text-base text-gray-900 hover:text-brand-purple transition-colors font-medium"
                      >
                        Hire talent
                      </Link>
                    )}

                    {/* About Us Link - Show for non-users and admins */}
                    {(!user || (user.role && ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(user.role))) && (
                      <Link href="/about-us" className="text-base text-gray-900 hover:text-brand-purple transition-colors font-medium">
                        About Us
                      </Link>
                    )}

                    {/* Authenticated User Menus */}
                    {user?.role === 'TALENT' && (
                      <>
                        <Link href="/talent/applications" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Applications
                        </Link>
                        <Link href="/talent/messages" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Messages
                        </Link>
                        <Link href="/talent/profile" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Profile
                        </Link>
                      </>
                    )}

                    {user?.role === 'CLIENT' && (
                      <>
                        <Link href="/recruiter/dashboard" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Dashboard
                        </Link>
                        <Link href="/recruiter/jobs/create" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Post Job
                        </Link>
                        <Link href="/recruiter/talent-search" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Talent Search
                        </Link>
                        <Link href="/recruiter/applicants" className="text-gray-900 hover:text-brand-purple transition-colors font-medium">
                          Applicants
                        </Link>
                      </>
                    )}
                  </>
                )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Search Bar removed when user is logged in */}

                {/* Profile Dropdown */}
                <div className="relative" ref={(el) => { dropdownRefs.current['profile'] = el }}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white text-sm font-semibold hover:ring-2 hover:ring-brand-purple"
                  >
                    {(user.fullName || user.email)?.[0]?.toUpperCase() || 'U'}
                  </button>
                  {activeDropdown === 'profile' && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <div className="px-4 py-3 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white text-lg font-semibold">
                            {(user.fullName || user.email)?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {user.fullName || user.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.role === 'TALENT' ? 'Talent' 
                                : user.role === 'CLIENT' ? 'Client' 
                                : user.role?.includes('ADMIN') || user.role === 'ANALYST' ? 'Admin'
                                : 'User'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {(user?.role === 'SUPER_ADMIN' || user?.role === 'QUALITY_ADMIN' || user?.role === 'SUPPORT_ADMIN' || user?.role === 'ANALYST') && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="font-medium">Dashboard</span>
                        </Link>
                      )}

                      <Link
                        href={user.role === 'TALENT' ? '/talent/settings' : '/settings'}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Account settings</span>
                      </Link>
                      <div className="border-t my-2"></div>
                      <button
                        onClick={async () => {
                          // Logout from Supabase if admin user
                          if (supabaseUser) {
                            const supabase = createClient()
                            await supabase.auth.signOut()
                          }
                          // Logout from auth context
                          logout()
                          setActiveDropdown(null)
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900 w-full text-left"
                      >
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link href="/login" className="text-gray-900 hover:text-gray-700 font-medium transition-colors">
                  Log in
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full px-4">
                    Try for free
                  </Button>
                </Link>
              </div>
            )}
          </div>
          </div>
        </div>
      </nav>

      {/* Minimal Navbar - Shows when scrolling down */}
      <nav className="lg:hidden fixed top-2 sm:top-4 left-2 right-2 sm:left-4 sm:right-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg z-[55] transition-transform duration-300 translate-y-0 opacity-100">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 relative flex-nowrap">
            {/* Left spacer - untuk balance layout */}
            <div className="w-1/3 flex justify-start flex-shrink-0">
              {/* Logo - Center (default), Left (when menu open) */}
              <div className={`transition-all duration-300 flex-shrink-0 ${
                showMobileMenu 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-0 w-0 overflow-hidden'
              }`}>
                <Logo />
              </div>
            </div>

            {/* Center - Logo (default) atau Menu (when open) */}
            <div className="w-1/3 flex justify-center flex-shrink-0">
              {/* Logo - Center (default) */}
              <div className={`transition-all duration-300 flex-shrink-0 ${
                showMobileMenu 
                  ? 'opacity-0 scale-0 absolute pointer-events-none' 
                  : 'opacity-100 scale-100'
              }`}>
                <Logo />
              </div>
              
              {/* Menu - Center (when menu open) - Show all menu items for logged in users */}
              <div className={`hidden lg:flex transition-all duration-300 flex-shrink-0 ${showMobileMenu ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-0 absolute pointer-events-none'}`}>
                <div className="flex items-center space-x-4 flex-nowrap">
                  {/* Show Find Jobs for TALENT and non-users */}
                  {(!user || user.role === 'TALENT' || (user.role && ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(user.role))) && (
                    <Link href={user?.role === 'TALENT' ? "/talent/jobs" : "/jobs"} className="text-base text-gray-900 hover:text-brand-purple transition-colors font-medium whitespace-nowrap" onClick={() => setShowMobileMenu(false)}>
                      Find Jobs
                    </Link>
                  )}
                  {/* Show Hire Talent for CLIENT and non-users */}
                  {(!user || user.role === 'CLIENT' || (user.role && ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(user.role))) && (
                    <Link href="/hire-talent" className="text-base text-gray-900 hover:text-brand-purple transition-colors font-medium whitespace-nowrap" onClick={() => setShowMobileMenu(false)}>
                      Hire talent
                    </Link>
                  )}
                  {/* About Us - Show for all */}
                  <Link href="/about-us" className="text-base text-gray-900 hover:text-brand-purple transition-colors font-medium whitespace-nowrap" onClick={() => setShowMobileMenu(false)}>
                    About Us
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side - Try for free button + Burger or User avatar */}
            <div className="w-1/3 flex items-center justify-end gap-3 flex-shrink-0">
              {!user ? (
                <>
                  <Link href="/register" className="hidden sm:inline-flex">
                    <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full px-4">
                      Try for free
                    </Button>
                  </Link>
                  {/* Burger Menu - Paling kanan setelah Try for free */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMobileMenu(!showMobileMenu)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors z-50 relative"
                    aria-label="Menu"
                  >
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {/* Profile Avatar */}
                    <div className="relative" ref={(el) => { dropdownRefs.current['profile-minimal'] = el }}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === 'profile-minimal' ? null : 'profile-minimal')}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white text-sm font-semibold hover:ring-2 hover:ring-brand-purple transition-all"
                      >
                        {(user.fullName || user.email)?.[0]?.toUpperCase() || 'U'}
                      </button>
                      {activeDropdown === 'profile-minimal' && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white text-lg font-semibold">
                            {(user.fullName || user.email)?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.fullName || user.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.role === 'TALENT' ? 'Talent' 
                                : user.role === 'CLIENT' ? 'Client' 
                                : user.role?.includes('ADMIN') || user.role === 'ANALYST' ? 'Admin'
                                : 'User'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {user.role === 'TALENT' && (
                        <>
                          <Link
                            href="/talent/status"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Profile Status</span>
                          </Link>
                        </>
                      )}
                      {(user?.role === 'SUPER_ADMIN' || user?.role === 'QUALITY_ADMIN' || user?.role === 'SUPPORT_ADMIN' || user?.role === 'ANALYST') && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="font-medium">Dashboard</span>
                        </Link>
                      )}
                      <div className="border-t my-2"></div>
                      <Link
                        href={user?.role === 'TALENT' ? '/talent/settings' : '/settings'}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Account settings</span>
                      </Link>
                      <div className="border-t my-2"></div>
                      <button
                        onClick={async () => {
                          if (supabaseUser) {
                            const supabase = createClient()
                            await supabase.auth.signOut()
                          }
                          logout()
                          setActiveDropdown(null)
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-900 w-full text-left"
                      >
                        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Log out</span>
                      </button>
                        </div>
                      )}
                    </div>
                  {/* Burger Menu - Di sebelah avatar - Show all menu items for logged in users */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMobileMenu(!showMobileMenu)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors z-50 relative"
                    aria-label="Menu"
                  >
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className={`fixed left-0 right-0 bg-white/95 backdrop-blur-lg border-b shadow-lg z-50 ${!showFullNavbar && isScrolled ? 'top-14' : 'top-16'}`} onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto w-full max-w-none px-4 py-4 space-y-2">
              {/* Menu items - Same order as landing page navbar */}
              {/* Find Jobs - Show for non-users and TALENT users */}
              {(!user || user.role === 'TALENT' || (user.role && ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(user.role))) && (
                <Link 
                  href={user?.role === 'TALENT' ? "/talent/jobs" : "/jobs"} 
                  className="block py-2 text-base text-gray-900 hover:text-brand-purple font-medium" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  Find Jobs
                </Link>
              )}
              
              {/* Hire talent - Show for non-users, CLIENT, and admins */}
              {(!user || user.role === 'CLIENT' || (user.role && ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(user.role))) && (
                <Link 
                  href="/hire-talent" 
                  className="block py-2 text-base text-gray-900 hover:text-brand-purple font-medium" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  Hire talent
                </Link>
              )}
              
              {/* About Us - Show for all */}
              <Link 
                href="/about-us" 
                className="block py-2 text-base text-gray-900 hover:text-brand-purple font-medium" 
                onClick={() => setShowMobileMenu(false)}
              >
                About Us
              </Link>
              
              {/* Login and Try for free - Only for non-authenticated users */}
              {!user && (
                <>
                  <div className="border-t my-2"></div>
                  <Link 
                    href="/login" 
                    className="block py-2 text-base text-gray-900 hover:text-brand-purple font-medium" 
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium" onClick={() => setShowMobileMenu(false)}>
                      Try for free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
