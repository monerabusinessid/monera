'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'
import Image from 'next/image'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'clients' | 'talents'>('clients')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [clientTestimonials, setClientTestimonials] = useState<any[]>([])
  const [talentTestimonials, setTalentTestimonials] = useState<any[]>([])
  const [trustedCompanies, setTrustedCompanies] = useState<any[]>([])
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0)
  const [talentCategories, setTalentCategories] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || 'https://calendar.google.com/calendar/u/0/r/eventedit?add=monerabusiness.id@gmail.com&text=Monera%20Intro%20Call&details=Intro%20call%20with%20Monera%20team'
  const isCalendarExternal = calendarUrl.startsWith('http')
  const flaticonIcons = {
    check: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
    bolt: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
    star: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
    user: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    target: 'https://cdn-icons-png.flaticon.com/512/846/846449.png',
    globe: 'https://cdn-icons-png.flaticon.com/512/535/535239.png',
    brain: 'https://cdn-icons-png.flaticon.com/512/2103/2103658.png',
    search: 'https://cdn-icons-png.flaticon.com/512/751/751463.png',
    growth: 'https://cdn-icons-png.flaticon.com/512/3135/3135692.png',
    code: 'https://cdn-icons-png.flaticon.com/512/1055/1055687.png',
    design: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
    office: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
  }
  const howItWorksIcons = {
    profile: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
    vetted: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
    matched: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
    remote: 'https://cdn-icons-png.flaticon.com/512/1534/1534938.png'
  }
  // Initialize headerSettings with default values
  // These will be used until API data is fetched
  const [headerSettings, setHeaderSettings] = useState<any>({
    hero_image_url: '',
    hero_title: 'Hire Vetted Remote Talent | Premium Talent Marketplace',
    hero_subtitle: 'Quality-First Freelance Platform | Pre-Vetted Remote Talent',
    hero_description: 'Connect with pre-screened remote talent ready to deliver quality work. AI-powered matching, vetted professionals, no unqualified applicants.',
    hero_image_width: '100%',
    hero_image_height: 'auto',
    hero_image_object_fit: 'cover',
    hero_image_border_radius: '24px',
    hero_image_opacity: '1',
    hero_image_position: 'center',
    hero_image_alignment: 'center'
  })
  
  const [loadingData, setLoadingData] = useState(true)
  const [headerSettingsLoaded, setHeaderSettingsLoaded] = useState(false)
  
  // Debug: Log header settings changes
  useEffect(() => {
    if (headerSettings.hero_image_url) {
      console.log('Header image URL updated:', headerSettings.hero_image_url)
    }
  }, [headerSettings.hero_image_url])
  
  // Refs for scroll reveal animations
  const heroRef = useRef<HTMLDivElement>(null)
  const trustedRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const whyDifferentRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading) return
    if (!user) return

    const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN']

    // Immediate redirect without showing loading
    if (user.role === 'TALENT') {
      router.replace('/talent')
      return
    }
    if (user.role === 'CLIENT') {
      router.replace('/client')
      return
    }
    if (adminRoles.includes(user.role)) {
      router.replace('/admin')
    }
  }, [user, loading, router])

  // Scroll reveal effect
  useEffect(() => {
    // Only run on client-side and after component mounts
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // If IntersectionObserver not available, reveal all elements immediately
      const refs = [heroRef, trustedRef, testimonialsRef, categoriesRef, whyDifferentRef, howItWorksRef, faqRef, ctaRef]
      refs.forEach((ref) => {
        if (ref.current) {
          ref.current.classList.add('revealed')
        }
      })
      return
    }

    // Reveal elements immediately on mount (they start visible now)
    const refs = [heroRef, trustedRef, testimonialsRef, categoriesRef, whyDifferentRef, howItWorksRef, faqRef, ctaRef]
    refs.forEach((ref) => {
      if (ref.current) {
        ref.current.classList.add('revealed')
      }
    })

    // Then set up observer for scroll animations on subsequent sections
    const timer = setTimeout(() => {
      try {
        const observerOptions = {
          threshold: 0.1,
          rootMargin: '0px 0px -100px 0px'
        }

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed')
            }
          })
        }, observerOptions)

        // Observe all refs for scroll animations
        refs.forEach((ref) => {
          if (ref.current) {
            observer.observe(ref.current)
          }
        })

        return () => {
          refs.forEach((ref) => {
            if (ref.current) {
              observer.unobserve(ref.current)
            }
          })
        }
      } catch (error) {
        console.warn('IntersectionObserver setup failed:', error)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Fetch landing page data from database - OPTIMIZED: Parallel fetch all data
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoadingData(true)
        
        // OPTIMIZATION: Fetch all data in parallel instead of sequential
        // This reduces total loading time significantly
        const timestamp = Date.now()
        
        console.log('[HomePage] Starting parallel fetch of landing page data...')
        const startTime = performance.now()
        
        // Fetch all data in parallel
        const [testimonialsRes, companiesRes, categoriesRes, faqsRes, settingsRes] = await Promise.all([
          fetch(`/api/landing/testimonials?t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/landing/companies?t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/landing/talent-categories?t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/landing/faqs?t=${timestamp}`, { cache: 'no-store' }),
          fetch(`/api/landing/settings?t=${timestamp}`, { cache: 'no-store' })
        ])
        
        // Parse all responses in parallel
        const [testimonialsData, companiesData, categoriesData, faqsData, settingsData] = await Promise.all([
          testimonialsRes.json(),
          companiesRes.json(),
          categoriesRes.json(),
          faqsRes.json(),
          settingsRes.json()
        ])
        
        const endTime = performance.now()
        console.log(`[HomePage] Parallel fetch completed in ${(endTime - startTime).toFixed(2)}ms`)
        
        // Process testimonials
        if (testimonialsData.success) {
          const allTestimonials = testimonialsData.data || []
          setClientTestimonials(allTestimonials.filter((t: any) => t.type === 'CLIENT'))
          setTalentTestimonials(allTestimonials.filter((t: any) => t.type === 'TALENT'))
        }
        
        // Process companies
        if (companiesData.success) {
          console.log('Companies fetched:', companiesData.data?.length || 0)
          setTrustedCompanies(companiesData.data || [])
        } else {
          console.error('Failed to fetch companies:', companiesData.error)
        }
        
        // Process categories
        if (categoriesData.success) {
          setTalentCategories(categoriesData.data || [])
        }
        
        // Process FAQs
        if (faqsData.success) {
          setFaqs(faqsData.data || [])
        }
        
        // Process header settings
        if (settingsData.success) {
          console.log('Header settings fetched from API:', settingsData.data)
          const mergedSettings = {
            hero_image_url: '',
            hero_title: '',
            hero_subtitle: '',
            hero_description: '',
            hero_image_width: '100%',
            hero_image_height: 'auto',
            hero_image_object_fit: 'cover',
            hero_image_border_radius: '24px',
            hero_image_opacity: '1',
            hero_image_position: 'center',
            hero_image_alignment: 'center',
            ...settingsData.data
          }
          console.log('Merged header settings:', mergedSettings)
          setHeaderSettings(mergedSettings)
          setHeaderSettingsLoaded(true)
        } else {
          console.error('Failed to fetch header settings:', settingsData.error)
          setHeaderSettingsLoaded(true)
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error)
        setHeaderSettingsLoaded(true)
        // Fallback to default data if API fails
        setClientTestimonials([
          { name: 'Sarah Chen', role: 'CEO, TechStart', content: 'Found the perfect developer in 2 days. Quality-first approach saved us weeks of screening.', avatar: '' },
          { name: 'Emily Watson', role: 'HR Director, ScaleUp', content: 'Pre-vetted talent means less time interviewing, more time building.', avatar: '' },
        ])
        setTalentTestimonials([
          { name: 'Michael Rodriguez', role: 'Freelance Designer', content: 'Best match jobs are game-changing. Only see opportunities that actually fit my skills.', avatar: '' },
          { name: 'Alex Johnson', role: 'Full-Stack Developer', content: 'Profile readiness unlocked best matches. No more spam applying to irrelevant jobs.', avatar: '' },
        ])
        setTrustedCompanies([
          { name: 'Microsoft', logo: flaticonIcons.office },
          { name: 'Google', logo: flaticonIcons.office },
          { name: 'Amazon', logo: flaticonIcons.office },
        ])
        setTalentCategories([
          { name: 'Developers', icon: flaticonIcons.code, count: '500+' },
          { name: 'Designers', icon: flaticonIcons.design, count: '300+' },
        ])
        setFaqs([
          { question: 'How does Monera ensure quality?', answer: 'We have a rigorous vetting process that validates every profile before they can apply to jobs.' },
        ])      } finally {
        setLoadingData(false)
      }
    }
    
    fetchLandingData()
  }, [])

  // Auto-rotate companies every 3 seconds (show 6 at a time)
  useEffect(() => {
    if (trustedCompanies.length <= 6) return // No need to rotate if 6 or less
    
    const interval = setInterval(() => {
      setCurrentCompanyIndex((prev) => {
        const nextIndex = prev + 6
        // If next batch would exceed array, loop back to start
        return nextIndex >= trustedCompanies.length ? 0 : nextIndex
      })
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [trustedCompanies.length])



  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching landing page data
  if (loadingData && !headerSettingsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  // Show loading state while checking auth or if user is logged in (will redirect)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }
  // talentCategories now comes from database via state

  const howItWorks = [
    {
      step: 1,
      title: 'Create Profile',
      description: 'Build your professional profile with skills, experience, and portfolio.',
      icon: howItWorksIcons.profile,
      iconAlt: 'Profile setup',
    },
    {
      step: 2,
      title: 'Get Vetted',
      description: 'Our system validates your profile to ensure quality matches.',
      icon: howItWorksIcons.vetted,
      iconAlt: 'Verification',
    },
    {
      step: 3,
      title: 'Get Matched',
      description: 'Receive job recommendations that match your skills and preferences.',
      icon: howItWorksIcons.matched,
      iconAlt: 'Targeted matches',
    },
    {
      step: 4,
      title: 'Work Remotely',
      description: 'Start working with vetted clients on quality projects.',
      icon: howItWorksIcons.remote,
      iconAlt: 'Remote work',
    },
  ]

  const whyDifferent = [
    {
      title: 'Quality First',
      description: 'Only ready profiles can apply. No spam, no noise.',
      icon: flaticonIcons.star,
      iconAlt: 'Quality focus',
    },
    {
      title: 'Smart Matching',
      description: 'AI-powered matching based on skills, rate, and availability.',
      icon: flaticonIcons.brain,
      iconAlt: 'Smart matching',
    },
    {
      title: 'Vetted Talent',
      description: 'Every profile is validated before work begins.',
      icon: flaticonIcons.search,
      iconAlt: 'Vetted talent',
    },
    {
      title: 'Better Outcomes',
      description: 'Higher success rate with quality-focused approach.',
      icon: flaticonIcons.growth,
      iconAlt: 'Better outcomes',
    },
  ]
  const categoryIconMap: Record<string, string> = {
    Developers: flaticonIcons.code,
    Designers: flaticonIcons.design,
  }

  // clientTestimonials, talentTestimonials, trustedCompanies now come from database via state

  // Generate structured data (JSON-LD)
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://monera.com'
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Monera",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "description": "Monera is a quality-first talent platform connecting businesses with pre-screened remote professionals.",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@monera.com"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Monera",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/jobs?query={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      }
    ]
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Talent Marketplace",
    "provider": {
      "@type": "Organization",
      "name": "Monera"
    },
    "description": "Connect with pre-screened remote professionals and vetted talent. Quality-first hiring platform with AI-powered matching.",
    "areaServed": "Worldwide",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": siteUrl,
      "serviceType": "Online Platform"
    }
  }

  // FAQ Schema
  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question || faq.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer || faq.description
      }
    }))
  } : null

  return (
    <>
      {/* Structured Data (JSON-LD) */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="min-h-screen" role="main">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] text-white -mt-20 sm:-mt-24 pt-44 sm:pt-40 md:pt-40 pb-16 md:pb-20 overflow-hidden flex items-center bg-gradient-to-br from-brand-purple via-purple-900 to-indigo-950"
        style={{
          backgroundImage: headerSettings.hero_image_url
            ? `linear-gradient(135deg, rgba(111, 3, 205, 0.97) 0%, rgba(60, 16, 120, 0.88) 55%, rgba(20, 14, 60, 0.18) 80%, rgba(20, 14, 60, 0.02) 100%), url('${headerSettings.hero_image_url}')`
            : undefined,
          backgroundSize: headerSettings.hero_image_url ? 'cover' : undefined,
          backgroundPosition: headerSettings.hero_image_url ? '75% center' : undefined
        }}
        aria-label="Hero section"
      >
        <div className="absolute inset-0 overflow-hidden -top-20 md:-top-24">
          <div className="absolute inset-0">
            {[...Array(80)].map((_, i) => (
              <div
                key={`hero-star-${i}`}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${Math.random() * 4 + 2}s`,
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
          </div>
          <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-brand-yellow/40 via-purple-400/30 to-indigo-400/30 rounded-full blur-3xl animate-float-slow opacity-80"></div>
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-brand-yellow/30 rounded-full blur-3xl animate-float-reverse opacity-70"></div>
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/25 to-indigo-400/25 rounded-full blur-2xl animate-float-medium opacity-60"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-yellow/25 to-purple-400/25 rounded-full blur-2xl animate-float-slow opacity-50"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-float-fast opacity-70"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl animate-float-medium opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse-slow transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center max-w-7xl mx-auto">
            {/* Left Side - Headline & Buttons */}
            <div className="text-left scroll-reveal-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 font-headline leading-[1.1] tracking-tight animate-fade-in text-white">
                {headerSettings.hero_title && headerSettings.hero_title.trim() !== '' ? headerSettings.hero_title : 'Hire Vetted Remote Talent | Premium Talent Marketplace'}
                {headerSettings.hero_subtitle && headerSettings.hero_subtitle.trim() !== '' && (
                  <>
                    <br />
                    <span className="text-brand-yellow">
                      {headerSettings.hero_subtitle}
                    </span>
                  </>
                )}
              </h1>
              {headerSettings.hero_description && headerSettings.hero_description.trim() !== '' && (
              <p className="text-lg md:text-xl text-purple-100 mb-6 md:mb-8 leading-relaxed max-w-2xl opacity-90 animate-slide-up">
                {headerSettings.hero_description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8 md:mb-10">
              {isCalendarExternal ? (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="group">
                  <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-lg px-12 py-8 whitespace-nowrap shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl">
                    Find Talent →
                  </Button>
                </a>
              ) : (
                <Link href={calendarUrl} className="group">
                  <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-lg px-12 py-8 whitespace-nowrap shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl">
                    Find Talent →
                  </Button>
                </Link>
              )}
                <Link href="/jobs" className="group">
                  <Button size="lg" variant="outline" className="!border-2 !border-white/40 !text-white !bg-white/10 backdrop-blur-md hover:!bg-white/20 hover:!border-white font-semibold text-lg px-12 py-8 whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl">
                    Join as Talent
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-purple-200">
                <div className="flex items-center gap-2 group cursor-default">
                  <img src={flaticonIcons.check} alt="" className="w-6 h-6" loading="lazy" decoding="async" />
                  <span className="font-semibold">Vetted Profiles</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default">
                  <img src={flaticonIcons.star} alt="" className="w-6 h-6" loading="lazy" decoding="async" />
                  <span className="font-semibold">Quality First</span>
                </div>
              </div></div>
            {/* Right Side - Background image only */}
            <div className="lg:block scroll-reveal-right mt-8 lg:mt-0 mb-6 lg:mb-0" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Scrolling Logos */}
        <section ref={trustedRef} className="py-16 bg-white border-b border-gray-100 rounded-t-3xl -mt-6 sm:-mt-8 relative z-10 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 scroll-reveal">
              <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
                <span className="text-sm font-semibold text-brand-purple">Trusted by Industry Leaders</span>
              </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">
              <span className="text-brand-purple">100+ companies</span> hire vetted talent through Monera
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by <span className="text-brand-purple font-semibold">Industry Leaders</span> who value <span className="text-brand-yellow font-semibold">quality</span> over quantity
            </p>
          </div>
          
          {/* Company Logos - Rotating Carousel (6 at a time) */}
            <div className="w-full max-w-7xl mx-auto min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px] flex items-center justify-center">
              {trustedCompanies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full items-center justify-items-center">
                  {(() => {
                    // Get current batch of 6 companies (with wrap-around)
                    const getCurrentBatch = () => {
                    const batch = []
                    for (let i = 0; i < 6; i++) {
                      const index = (currentCompanyIndex + i) % trustedCompanies.length
                      batch.push(trustedCompanies[index])
                    }
                    return batch
                  }
                  return getCurrentBatch().map((company, idx) => {
                    const isImageUrl = company.logo && (company.logo.startsWith('http') || company.logo.startsWith('/'))
                    const logoSrc = isImageUrl ? company.logo : flaticonIcons.office
                    return (
                      <div
                        key={`${company.id || idx}-${currentCompanyIndex}`}
                        className="flex items-center justify-center group w-full h-full animate-fade-in"
                      >
                        <img
                          src={logoSrc}
                          alt={`${company.name || 'Company'} logo - Trusted partner of Monera talent marketplace`}
                          className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] object-contain group-hover:scale-110 transition-transform duration-300 filter grayscale hover:grayscale-0"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.src = flaticonIcons.office
                          }}
                        />
                      </div>
                    )
                  })
                })()}
              </div>
            ) : (
              <div className="text-gray-400">Loading companies...</div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials with Tabs - KeyGuard Style */}
      <section ref={testimonialsRef} className="py-20 bg-gray-50 rounded-t-3xl -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline">
              Real Talk from Real Users
            </h2>
          </div>
          
          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-12 scroll-reveal-scale">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                activeTab === 'clients'
                  ? 'bg-brand-purple text-white shadow-xl scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-md'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setActiveTab('talents')}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                activeTab === 'talents'
                  ? 'bg-brand-purple text-white shadow-xl scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-md'
              }`}
            >
              Talents
            </button>
          </div>

          {/* Client Testimonials - Static Grid */}
          {activeTab === 'clients' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal-scale">
              {clientTestimonials.map((testimonial, idx) => {
                const isAvatarImage = testimonial.avatar && (testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/'))
                const avatarInitial = (testimonial.name || 'U')[0].toUpperCase()
                return (
                  <Card key={idx} className={`border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 bg-white rounded-2xl shadow-lg scroll-reveal-scale stagger-${idx + 1}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-3">
                        {isAvatarImage ? (
                          <Image
                            src={testimonial.avatar}
                            alt={`${testimonial.name || 'User'} profile picture`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-brand-purple/20"
                            unoptimized
                            loading="lazy"
                            onError={(e) => {
                              // Fallback ke gradient circle dengan initial
                              const parent = (e.target as HTMLImageElement).parentElement
                              if (parent) {
                                parent.innerHTML = `<div class="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">${(testimonial.name || 'U')[0].toUpperCase()}</div>`
                              }
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {avatarInitial}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900">@{testimonial.name.split(' ')[0]}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">{testimonial.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-base leading-relaxed">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Talent Testimonials - Static Grid */}
          {activeTab === 'talents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-reveal-scale">
              {talentTestimonials.map((testimonial, idx) => {
                const isAvatarImage = testimonial.avatar && (testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/'))
                const avatarInitial = (testimonial.name || 'U')[0].toUpperCase()
                return (
                  <Card key={idx} className={`border-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 bg-white rounded-2xl shadow-lg scroll-reveal-scale stagger-${idx + 1}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-3">
                        {isAvatarImage ? (
                          <Image
                            src={testimonial.avatar}
                            alt={`${testimonial.name || 'User'} profile picture`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-brand-purple/20"
                            unoptimized
                            loading="lazy"
                            onError={(e) => {
                              // Fallback ke gradient circle dengan initial
                              const parent = (e.target as HTMLImageElement).parentElement
                              if (parent) {
                                parent.innerHTML = `<div class="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">${(testimonial.name || 'U')[0].toUpperCase()}</div>`
                              }
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {avatarInitial}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900">@{testimonial.name.split(' ')[0]}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">{testimonial.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-base leading-relaxed">"{testimonial.content}"</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>


      {/* Talent Categories - All Aligned */}
      <section ref={categoriesRef} className="py-20 bg-white rounded-t-3xl -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
              <span className="text-sm font-semibold text-brand-purple">Browse by Category</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Remote Talent Directory</h2>
            <p className="text-lg text-gray-600">Find pre-vetted remote professionals and independent contractors across all skill categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {talentCategories.map((category, idx) => {
              const staggerClass = `stagger-${(idx % 6) + 1}`
              const isCategoryIconUrl = typeof category.icon === 'string' && (category.icon.startsWith('http') || category.icon.startsWith('/'))
              const categoryIconSrc = isCategoryIconUrl
                ? category.icon
                : (categoryIconMap[category.name] || flaticonIcons.user)
              return (
              <div
                key={category.name}
                className="group"
              >
                <Card className={`text-center hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-brand-purple hover:bg-gradient-to-br hover:from-purple-50 hover:to-yellow-50/50 hover:-translate-y-3 hover:scale-105 scroll-reveal-scale ${staggerClass} rounded-2xl bg-white h-full flex flex-col`}>
                  <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
                    <img src={categoryIconSrc} alt={`${category.name} icon`} className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" />
                    <h3 className="font-bold text-base text-gray-800 group-hover:text-brand-purple transition-colors duration-300 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs font-semibold text-brand-purple">{category.count} available</p>
                  </CardContent>
                </Card>
              </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Different from Upwork - KeyGuard Style - Single Column */}
      <section ref={whyDifferentRef} className="py-20 bg-white rounded-t-3xl -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline">
              Why Monera is Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto scroll-reveal-scale stagger-1 leading-relaxed">
              Connect with pre-screened remote talent ready to deliver quality work. AI-powered matching, vetted professionals, no unqualified applicants.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {whyDifferent.map((item, idx) => {
              const staggerClass = `stagger-${idx + 1}`
              return (
              <Card 
                key={idx} 
                className={`bg-gradient-to-br from-brand-purple to-purple-700 text-white border-0 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 scroll-reveal-scale ${staggerClass} rounded-2xl overflow-hidden`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                      <img src={item.icon} alt={item.iconAlt} className="w-9 h-9" loading="lazy" decoding="async" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-white mb-2">{item.title}</CardTitle>
                      <p className="text-purple-100 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section - Dora Style (Blue Background) */}
      <section ref={howItWorksRef} className="py-24 bg-gradient-to-br from-brand-purple via-purple-700 to-indigo-800 text-white relative overflow-hidden rounded-t-3xl -mt-8">
        {/* Subtle Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <span className="text-sm font-semibold text-brand-yellow">HOW IT WORKS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline">How to Hire Remote Talent & Find Quality Professionals</h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                Monera's streamlined process makes it easy to find and hire pre-vetted remote professionals. From profile creation to smart matching, our quality-first freelance platform delivers the best talent for your projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, idx) => (
                <div
                  key={idx}
                  className={`scroll-reveal-scale stagger-${idx + 1} bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-2`}
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                    <img
                      src={step.icon}
                      alt={step.iconAlt}
                      className="w-9 h-9"
                      style={{ filter: 'brightness(0) invert(1)' }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="text-brand-yellow text-sm font-semibold mb-2">STEP {step.step}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-purple-100 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Dropdown Style */}
      <section ref={faqRef} className="py-24 bg-gray-900 text-white relative overflow-hidden rounded-t-3xl -mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <div className="inline-block px-4 py-2 bg-brand-purple/20 rounded-full mb-6 border border-brand-purple/30">
                <span className="text-sm font-semibold text-brand-yellow">FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline">Got questions? We've got answers.</h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Everything you need to know about Monera's quality-first talent marketplace.
              </p>
            </div>

            <div className="space-y-4">
              {(faqs.length > 0 ? faqs : [
                {
                  question: "How does Monera ensure quality talent?",
                  answer: "All talent profiles go through a comprehensive vetting process before they can apply to jobs. We validate skills, experience, and portfolio quality to ensure only ready professionals can participate."
                },
                {
                  question: "What makes Monera different from other platforms?",
                  answer: "Monera focuses on quality over quantity. We pre-vet all profiles, use smart matching algorithms, and ensure profiles are validated before work begins. This means less spam, better matches, and higher success rates."
                },
                {
                  question: "How long does the profile approval process take?",
                  answer: "Profile review typically takes 1-3 business days. Our team carefully reviews each profile to ensure quality standards. You'll receive notifications about your approval status and any revision requests."
                },
                {
                  question: "Can I post jobs as a client?",
                  answer: "Yes! Clients and recruiters can post jobs immediately after registration. You'll have access to vetted talent who have completed their profiles and are ready to work."
                },
                {
                  question: "What happens if my profile needs revision?",
                  answer: "If your profile needs improvements, you'll receive detailed revision notes explaining what needs to be updated. Simply make the changes and resubmit for review."
                },
                {
                  question: "Is there a fee to use Monera?",
                  answer: "Monera is completely free to use! Registration, profile creation, and job browsing are all free. No hidden fees, no subscription required."
                }
              ]).map((faq: any, idx: number) => (
                <Card
                  key={idx}
                  className={`bg-gray-800 border border-gray-700 hover:border-brand-purple/50 transition-all duration-300 scroll-reveal-scale stagger-${idx + 1} rounded-2xl overflow-hidden cursor-pointer`}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
                      <span>{faq.question}</span>
                      <span className={`text-brand-yellow text-2xl transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {openFaqIndex === idx && (
                    <CardContent className="pt-0 pb-6 animate-fade-in">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - KeyGuard Style */}
      <section ref={ctaRef} className="py-24 bg-white rounded-t-3xl -mt-8 relative overflow-hidden" aria-label="Call to action">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-headline scroll-reveal text-gray-900">
              Ready to Own Your Talent Search?
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed scroll-reveal-scale stagger-1">
              Hop on the Monera wave. Start free and find quality talent with smart matching. No hassle. Secure your hiring like the pro you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center scroll-reveal-scale stagger-2">
              <Link href="/register?role=TALENT">
                <Button size="lg" className="bg-brand-purple text-white hover:bg-purple-700 font-bold text-lg px-12 py-7 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 rounded-xl">
                  Try It Free →
                </Button>
              </Link>
              <Link href="/register?role=CLIENT">
                <Button size="lg" variant="outline" className="!border-2 !border-brand-purple !text-brand-purple !bg-white hover:!bg-purple-50 font-semibold text-lg px-12 py-7 hover:scale-110 transition-all duration-300 rounded-xl">
                  Hire Talent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </main>
    </>
  )
}







