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

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [clientTestimonials, setClientTestimonials] = useState<any[]>([])
  const [trustedCompanies, setTrustedCompanies] = useState<any[]>([])
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0)
  const [talentCategories, setTalentCategories] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || 'https://calendar.google.com/calendar/u/0/r/eventedit?add=monerabusiness.id@gmail.com&text=Monera%20Intro%20Call&details=Intro%20call%20with%20Monera%20team'
  const isCalendarExternal = calendarUrl.startsWith('http')
  // Custom SVG Icons with Monera Brand Colors
  const customIcons = {
    check: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="url(#gradient1)"/>
        <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient1" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    bolt: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#gradient2)"/>
        <defs>
          <linearGradient id="gradient2" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    star: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#gradient3)"/>
        <defs>
          <linearGradient id="gradient3" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    user: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="url(#gradient4)"/>
        <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="url(#gradient4)" strokeWidth="2.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradient4" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    target: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="url(#gradient5)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" stroke="url(#gradient5)" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="url(#gradient5)"/>
        <defs>
          <linearGradient id="gradient5" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    brain: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C9.5 3 7.5 4.5 7 6.5C6 6.5 5 7.5 5 9c0 1 .5 2 1.5 2.5C6 12 6 12.5 6 13c0 1.5 1 3 2.5 3.5.5 1.5 2 2.5 3.5 2.5s3-1 3.5-2.5C17 16 18 14.5 18 13c0-.5 0-1-.5-1.5C18.5 11 19 10 19 9c0-1.5-1-2.5-2-2.5C16.5 4.5 14.5 3 12 3z" fill="url(#gradient6)"/>
        <defs>
          <linearGradient id="gradient6" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    search: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="url(#gradient7)" strokeWidth="2.5"/>
        <path d="M16 16l5 5" stroke="url(#gradient7)" strokeWidth="2.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradient7" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    growth: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l4-4 4 4 6-6 4 4" stroke="url(#gradient8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 7h4v4" stroke="url(#gradient8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient8" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    code: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 4l-2 16" stroke="url(#gradient9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient9" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    design: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#gradient10)" opacity="0.5"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#gradient10)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="gradient10" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    office: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#gradient11)" strokeWidth="2"/>
        <path d="M3 9h18M9 3v18" stroke="url(#gradient11)" strokeWidth="2"/>
        <defs>
          <linearGradient id="gradient11" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    video: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="14" height="14" rx="2" fill="url(#gradientVideo)" opacity="0.3"/>
        <path d="M16 8.5l5-3v13l-5-3" fill="url(#gradientVideo)"/>
        <defs>
          <linearGradient id="gradientVideo" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    writer: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M4 20h16M4 16h12M4 12h16M4 8h12" stroke="url(#gradientWriter)" strokeWidth="2.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradientWriter" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    support: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="url(#gradientSupport)" strokeWidth="2"/>
        <path d="M9 9c0-1.5 1-3 3-3s3 1.5 3 3c0 2-3 2-3 4m0 3v.5" stroke="url(#gradientSupport)" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradientSupport" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    marketing: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M5 8l4-4 4 4" stroke="url(#gradientMarketing)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 4v8c0 3 2 5 5 5h5" stroke="url(#gradientMarketing)" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="19" cy="17" r="3" fill="url(#gradientMarketing)"/>
        <defs>
          <linearGradient id="gradientMarketing" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    qa: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3 8-8" stroke="url(#gradientQA)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" stroke="url(#gradientQA)" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradientQA" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#6F03CD"/>
            <stop offset="100%" stopColor="#FFC107"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    finance: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="url(#gradientFinance)" strokeWidth="2"/>
        <path d="M12 6v12M15 9h-4.5a1.5 1.5 0 000 3h3a1.5 1.5 0 010 3H9" stroke="url(#gradientFinance)" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="gradientFinance" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#FFC107"/>
            <stop offset="100%" stopColor="#6F03CD"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  }
  const howItWorksIcons = {
    profile: customIcons.user,
    vetted: customIcons.check,
    matched: customIcons.target,
    remote: customIcons.bolt
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
      // Preload hero image
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = headerSettings.hero_image_url
      link.fetchPriority = 'high'
      document.head.appendChild(link)
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
          { name: 'Sarah Chen', role: 'CEO, TechStart Singapore', content: 'Hired a full-time customer support rep at 75% cost savings. The onboarding was seamless, and our rep is now an integral part of our team.', avatar: '' },
          { name: 'Emily Watson', role: 'Founder, Australian Marketing Agency', content: 'Our Indonesian video editor produces 20+ videos weekly. Quality is exceptional, communication is smooth, and we saved thousands monthly.', avatar: '' },
          { name: 'James Mitchell', role: 'CTO, US SaaS Startup', content: 'Monera handled everything - recruitment, contracts, payroll. We got 3 pre-vetted developers in 48 hours. Best hiring decision we made.', avatar: '' },
        ])
        setTrustedCompanies([
          { name: 'Microsoft', logo: '' },
          { name: 'Google', logo: '' },
          { name: 'Amazon', logo: '' },
        ])
        setTalentCategories([
          { name: 'Developers', icon: '', count: '500+' },
          { name: 'Designers', icon: '', count: '300+' },
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
      icon: customIcons.star,
      iconAlt: 'Quality focus',
    },
    {
      title: 'Smart Matching',
      description: 'AI-powered matching based on skills, rate, and availability.',
      icon: customIcons.brain,
      iconAlt: 'Smart matching',
    },
    {
      title: 'Vetted Talent',
      description: 'Every profile is validated before work begins.',
      icon: customIcons.search,
      iconAlt: 'Vetted talent',
    },
    {
      title: 'Better Outcomes',
      description: 'Higher success rate with quality-focused approach.',
      icon: customIcons.growth,
      iconAlt: 'Better outcomes',
    },
  ]
  const categoryIconMap: Record<string, any> = {
    'Developers': customIcons.code,
    'Web Developer': customIcons.code,
    'Software Developer': customIcons.code,
    'Full Stack Developer': customIcons.code,
    'Frontend Developer': customIcons.code,
    'Backend Developer': customIcons.code,
    'Mobile Developer': customIcons.code,
    
    'Designers': customIcons.design,
    'Graphic Designer': customIcons.design,
    'UI/UX Designer': customIcons.design,
    'Product Designer': customIcons.design,
    'Web Designer': customIcons.design,
    
    'Video Editor': customIcons.video,
    'Content Creator': customIcons.video,
    'Animator': customIcons.video,
    
    'Social Media Manager': customIcons.marketing,
    'Digital Marketer': customIcons.marketing,
    'Marketing Manager': customIcons.marketing,
    'SEO Specialist': customIcons.marketing,
    
    'Content Writer': customIcons.writer,
    'Copywriter': customIcons.writer,
    'Technical Writer': customIcons.writer,
    'Blog Writer': customIcons.writer,
    
    'Customer Support': customIcons.support,
    'Customer Service': customIcons.support,
    'Support Representative': customIcons.support,
    'CSR': customIcons.support,
    
    'Executive Assistant': customIcons.office,
    'Virtual Assistant': customIcons.office,
    'Admin': customIcons.office,
    'Data Entry': customIcons.office,
    
    'QA Engineer': customIcons.qa,
    'Quality Assurance': customIcons.qa,
    'Tester': customIcons.qa,
    
    'Accountant': customIcons.finance,
    'Bookkeeper': customIcons.finance,
    'Finance': customIcons.finance,
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
        className="relative min-h-[100svh] text-white -mt-20 md:-mt-24 pt-32 md:pt-44 pb-12 sm:pb-16 md:pb-20 overflow-hidden flex items-center"
        style={{
          background: headerSettings.hero_image_url
            ? `linear-gradient(135deg, rgba(111, 3, 205, 0.95) 0%, rgba(60, 16, 120, 0.85) 50%, rgba(20, 14, 60, 0.15) 85%), url('${headerSettings.hero_image_url}')`
            : 'linear-gradient(135deg, #6f03cd 0%, #5a02a8 50%, #4a0288 100%)',
          backgroundSize: 'cover',
          backgroundPosition: '75% center',
          willChange: 'auto'
        }}
        aria-label="Hero section"
      >
        <div className="absolute inset-0 overflow-hidden -top-20 md:-top-24">
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 font-headline leading-[1.1] tracking-tight animate-slide-left text-white">
                {headerSettings.hero_title && headerSettings.hero_title.trim() !== '' ? headerSettings.hero_title : 'Hire Top 5% Indonesian Remote Talent'}
                {headerSettings.hero_subtitle && headerSettings.hero_subtitle.trim() !== '' ? (
                  <>
                    <br />
                    <span className="text-brand-yellow">
                      {headerSettings.hero_subtitle}
                    </span>
                  </>
                ) : (
                  <>
                    <br />
                    <span className="text-brand-yellow">
                      Save 60% on Operational Costs
                    </span>
                  </>
                )}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 md:mb-8 leading-relaxed max-w-2xl opacity-90 animate-slide-left" style={{ animationDelay: '0.2s' }}>
                {headerSettings.hero_description && headerSettings.hero_description.trim() !== '' 
                  ? headerSettings.hero_description 
                  : 'Build your dedicated remote team with pre-vetted Indonesian professionals. Complete HR & payroll management. 30-day replacement guarantee.'}
              </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-6 sm:mb-8 md:mb-10 animate-slide-left" style={{ animationDelay: '0.4s' }}>
              {isCalendarExternal ? (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="group w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl">
                    Book Free Consultation →
                  </Button>
                </a>
              ) : (
                <Link href={calendarUrl} className="group w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 shadow-2xl hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl">
                    Book Free Consultation →
                  </Button>
                </Link>
              )}
                <Link href="/register" className="group w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto !border-2 !border-white/40 !text-white !bg-white/10 backdrop-blur-md hover:!bg-white/20 hover:!border-white font-semibold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 hover:scale-105 active:scale-95 transition-all duration-300 rounded-2xl">
                    Join as Talent
                  </Button>
                </Link>
              </div>
            </div>
            {/* Right Side - Background image only */}
            <div className="lg:block scroll-reveal-right mt-8 lg:mt-0 mb-6 lg:mb-0" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 scroll-reveal">
            <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
              <span className="text-sm font-semibold text-brand-purple">OUR SERVICES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline">Build Your Dedicated Remote Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Full-time dedicated professionals. Not freelancers. <span className="text-brand-purple font-semibold">Save up to 60%</span> on operational costs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <Card className="border border-gray-200 hover:shadow-2xl transition-all duration-300 rounded-2xl animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-9 h-9">{customIcons.office}</div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">Operational Excellence</CardTitle>
                <CardDescription className="text-base text-gray-600">The Time Savers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Ideal for founders who want to offload repetitive tasks.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Executive Assistant</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Customer Success Rep</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Data Entry Specialist</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>General Admin</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-purple-50 to-yellow-50/30 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mb-4">
                  <div className="w-9 h-9">{customIcons.design}</div>
                </div>
                <div className="inline-block px-3 py-1 bg-brand-yellow text-gray-900 text-xs font-bold rounded-full mb-2">MOST POPULAR</div>
                <CardTitle className="text-2xl font-bold mb-2">Growth & Creative</CardTitle>
                <CardDescription className="text-base text-gray-600">The Brand Builders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Ideal for businesses that need a strong digital presence.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Social Media Manager</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Graphic Designer</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Video Editor (Reels/TikTok)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Content Writer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:shadow-2xl transition-all duration-300 rounded-2xl animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-9 h-9">{customIcons.code}</div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">Technical & Specialized</CardTitle>
                <CardDescription className="text-base text-gray-600">The Tech Enablers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Ideal for startups and tech companies.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Web Developer</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>QA Engineer</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>UI/UX Designer</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                    <span>Bookkeeper/Accountant</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">All prices include: Salary + Taxes + Benefits + HR Management + Platform Fee</p>
            {isCalendarExternal ? (
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-brand-purple text-white hover:bg-purple-700 font-bold px-8 py-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                  Get 3 Pre-Vetted Candidates in 48 Hours →
                </Button>
              </a>
            ) : (
              <Link href={calendarUrl}>
                <Button size="lg" className="bg-brand-purple text-white hover:bg-purple-700 font-bold px-8 py-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300">
                  Get 3 Pre-Vetted Candidates in 48 Hours →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Cost Comparison Section */}
      <section className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline">Why Companies Choose Monera</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Premium talent at a fraction of Western costs
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <Card className="border border-gray-200 rounded-2xl bg-white animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">LOCAL HIRE</div>
                    <CardTitle className="text-2xl font-bold mb-2">Singapore / Australia</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-3xl md:text-4xl font-bold text-gray-900">$3,000 - $5,000</p>
                    <p className="text-sm text-gray-500">per month (entry-level)</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>High operational costs</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>Long hiring process</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>Complex HR & payroll</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 rounded-2xl bg-white animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">FREELANCE PLATFORMS</div>
                    <CardTitle className="text-2xl font-bold mb-2">Upwork / Fiverr</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-3xl md:text-4xl font-bold text-gray-900">$20 - $100</p>
                    <p className="text-sm text-gray-500">per hour (varies)</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>Inconsistent quality</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>Risk of ghosting</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>No commitment</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-brand-purple rounded-2xl bg-gradient-to-br from-purple-50 to-yellow-50/30 shadow-xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <div className="text-center">
                    <div className="inline-block px-3 py-1 bg-brand-yellow text-gray-900 text-xs font-bold rounded-full mb-3">BEST VALUE</div>
                    <CardTitle className="text-2xl font-bold mb-2">Monera</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-3xl md:text-4xl font-bold text-brand-purple">$750 - $2,000</p>
                    <p className="text-sm text-gray-500">per month (all-inclusive)</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                      <span className="font-semibold">Top 5% vetted talent</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                      <span className="font-semibold">Full-time dedicated</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 mt-0.5">{customIcons.check}</div>
                      <span className="font-semibold">Complete HR management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <div className="inline-block px-6 py-3 bg-green-100 rounded-full">
                <p className="text-green-800 font-bold text-lg">💰 Save up to 60% on operational costs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-brand-purple rounded-3xl bg-gradient-to-br from-brand-purple to-purple-700 text-white shadow-2xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="text-center">
                  <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🛡️</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline">30-Day Replacement Guarantee</h2>
                  <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                    Not satisfied with your hire? We'll find you a replacement within 30 days—free of charge and as quickly as possible.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-brand-yellow mb-2">48 Hours</div>
                      <p className="text-purple-100">Get 3 pre-vetted candidates</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-brand-yellow mb-2">Top 5%</div>
                      <p className="text-purple-100">Only the best talent</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-brand-yellow mb-2">Zero Risk</div>
                      <p className="text-purple-100">30-day guarantee</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Scrolling Logos */}
        <section ref={trustedRef} className="py-12 sm:py-16 md:py-20 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #6f03cd 0%, #5502b8 100%)' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 scroll-reveal">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                <span className="text-sm font-semibold text-brand-yellow">Trusted by Industry Leaders</span>
              </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline text-white">
              <span className="text-brand-yellow">100+ companies</span> hire vetted talent through Monera
            </h2>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Trusted by <span className="text-brand-yellow font-semibold">Industry Leaders</span> who value <span className="text-white font-semibold">quality</span> over quantity
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
                    const logoSrc = isImageUrl ? company.logo : ''
                    return (
                      <div
                        key={`${company.id || idx}-${currentCompanyIndex}`}
                        className="flex items-center justify-center group w-full h-full animate-fade-in"
                      >
                        <div className="w-[100px] h-[50px] sm:w-[110px] sm:h-[55px] md:w-[120px] md:h-[60px] flex items-center justify-center">
                          <img
                            src={logoSrc}
                            alt={`${company.name || 'Company'} logo - Trusted partner of Monera talent marketplace`}
                            className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-110 transition-transform duration-300 brightness-0 invert group-hover:brightness-100 group-hover:invert-0"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const parent = e.currentTarget.parentElement
                              if (parent) {
                                parent.innerHTML = `<div class="text-white text-sm font-semibold">${company.name || 'Company'}</div>`
                              }
                            }}
                          />
                        </div>
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
      <section ref={testimonialsRef} className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
              <span className="text-sm font-semibold text-brand-purple">SUCCESS STORIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline">
              Trusted by Companies Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how businesses save costs and scale faster with Monera
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 scroll-reveal-scale">
              {clientTestimonials.map((testimonial, idx) => {
                const isAvatarImage = testimonial.avatar && (testimonial.avatar.startsWith('http') || testimonial.avatar.startsWith('/'))
                const avatarInitial = (testimonial.name || 'U')[0].toUpperCase()
                return (
                  <Card key={idx} className={`border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 bg-white rounded-2xl shadow-lg scroll-reveal-scale stagger-${idx + 1} animate-slide-up`} style={{ animationDelay: `${idx * 0.15}s` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-3">
                        {isAvatarImage ? (
                          <Image
                            src={testimonial.avatar}
                            alt={`${testimonial.name || 'User'} profile picture`}
                            width={48}
                            height={48}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-brand-purple/20"
                            unoptimized
                            loading="lazy"
                            onError={(e) => {
                              const parent = (e.target as HTMLImageElement).parentElement
                              if (parent) {
                                parent.innerHTML = `<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">${(testimonial.name || 'U')[0].toUpperCase()}</div>`
                              }
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
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
        </div>
      </section>


      {/* Available Roles Section */}
      <section ref={categoriesRef} className="py-12 sm:py-16 md:py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4 animate-fade-in">
              <span className="text-sm font-semibold text-brand-purple">AVAILABLE ROLES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline animate-slide-up" style={{ animationDelay: '0.1s' }}>Hire Across All Skill Categories</h2>
            <p className="text-lg text-gray-600 animate-slide-up" style={{ animationDelay: '0.2s' }}>From operations to tech - find the perfect fit for your team</p>
          </div>
          <div className="overflow-x-hidden relative py-4">
            <div className="flex gap-3 sm:gap-4 animate-scroll-left" style={{ width: 'max-content' }}>
              {[...talentCategories, ...talentCategories].map((category, idx) => {
              const staggerClass = `stagger-${(idx % 6) + 1}`
              const isCategoryIconUrl = typeof category.icon === 'string' && (category.icon.startsWith('http') || category.icon.startsWith('/'))
              
              // Get icon based on category name
              let categoryIconSrc = customIcons.user
              if (isCategoryIconUrl) {
                categoryIconSrc = category.icon
              } else if (category.name.toLowerCase().includes('developer') || category.name.toLowerCase().includes('programmer')) {
                categoryIconSrc = customIcons.code
              } else if (category.name.toLowerCase().includes('designer') || category.name.toLowerCase().includes('design')) {
                categoryIconSrc = customIcons.design
              } else if (category.name.toLowerCase().includes('video') || category.name.toLowerCase().includes('editor')) {
                categoryIconSrc = customIcons.video
              } else if (category.name.toLowerCase().includes('writer') || category.name.toLowerCase().includes('content')) {
                categoryIconSrc = customIcons.writer
              } else if (category.name.toLowerCase().includes('marketing') || category.name.toLowerCase().includes('social')) {
                categoryIconSrc = customIcons.marketing
              } else if (category.name.toLowerCase().includes('support') || category.name.toLowerCase().includes('customer')) {
                categoryIconSrc = customIcons.support
              } else if (category.name.toLowerCase().includes('data') || category.name.toLowerCase().includes('analyst')) {
                categoryIconSrc = customIcons.brain
              } else if (category.name.toLowerCase().includes('project') || category.name.toLowerCase().includes('manager')) {
                categoryIconSrc = customIcons.target
              } else if (categoryIconMap[category.name]) {
                categoryIconSrc = categoryIconMap[category.name]
              }
              return (
              <div
                key={`${category.name}-${idx}`}
                className="group flex-shrink-0 w-[160px]"
              >
                <Card className={`text-center hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-brand-purple hover:bg-gradient-to-br hover:from-purple-50 hover:to-yellow-50/50 hover:-translate-y-3 hover:scale-105 rounded-2xl bg-white h-full flex flex-col`}>
                  <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
                    {isCategoryIconUrl ? (
                      <img src={categoryIconSrc as string} alt={`${category.name} icon`} className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform duration-300">{categoryIconSrc}</div>
                    )}
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
        </div>
      </section>

      {/* Why Choose Monera */}
      <section ref={whyDifferentRef} className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
              <span className="text-sm font-semibold text-brand-purple">WHY MONERA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline">
              More Than Just Recruitment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto scroll-reveal-scale stagger-1 leading-relaxed">
              We're your dedicated remote team partner. From hiring to HR management, we handle everything.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <Card className="bg-gradient-to-br from-brand-purple to-purple-700 text-white border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 scroll-reveal-scale stagger-1 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <div className="w-9 h-9">{customIcons.star}</div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-white mb-2">Top 5% Talent Only</CardTitle>
                    <p className="text-purple-100 leading-relaxed">Rigorous 5-stage vetting process. We reject 95 out of 100 applicants. Only the best make it to your shortlist.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-purple to-purple-700 text-white border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 scroll-reveal-scale stagger-2 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <div className="w-9 h-9">{customIcons.bolt}</div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-white mb-2">Hire in 48 Hours, Not Months</CardTitle>
                    <p className="text-purple-100 leading-relaxed">Get 3 pre-vetted candidates within 48 hours. Interview and choose. Start working in a week.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-purple to-purple-700 text-white border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 scroll-reveal-scale stagger-3 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <div className="w-9 h-9">{customIcons.check}</div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-white mb-2">Complete HR & Payroll Management</CardTitle>
                    <p className="text-purple-100 leading-relaxed">We handle contracts, payroll, taxes, benefits, and compliance. You focus on growing your business.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-purple to-purple-700 text-white border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 scroll-reveal-scale stagger-4 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                    <div className="w-9 h-9">{customIcons.growth}</div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-white mb-2">Save Up to 60% on Costs</CardTitle>
                    <p className="text-purple-100 leading-relaxed">Premium talent at a fraction of Western costs. All-inclusive pricing with no hidden fees.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section - Dora Style (Blue Background) */}
      <section id="how-it-works" ref={howItWorksRef} className="py-12 sm:py-16 md:py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #6f03cd 0%, #5a02a8 100%)' }}>
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-headline">From Consultation to Onboarding in 4 Simple Steps</h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                We make hiring remote talent effortless. No lengthy recruitment process, no administrative headaches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="scroll-reveal-scale stagger-1 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="text-brand-yellow text-sm font-semibold mb-2">STEP 1</div>
                <h3 className="text-xl font-bold mb-3">Tell Us Your Needs</h3>
                <p className="text-purple-100 leading-relaxed">Book a free consultation. Share your requirements, budget, and team goals.</p>
              </div>

              <div className="scroll-reveal-scale stagger-2 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="text-brand-yellow text-sm font-semibold mb-2">STEP 2</div>
                <h3 className="text-xl font-bold mb-3">Meet Pre-Vetted Candidates</h3>
                <p className="text-purple-100 leading-relaxed">Get 3 qualified candidates within 48 hours. Interview and choose the best fit.</p>
              </div>

              <div className="scroll-reveal-scale stagger-3 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="text-brand-yellow text-sm font-semibold mb-2">STEP 3</div>
                <h3 className="text-xl font-bold mb-3">Seamless Onboarding</h3>
                <p className="text-purple-100 leading-relaxed">We handle contracts, equipment, and setup. You focus on team integration.</p>
              </div>

              <div className="scroll-reveal-scale stagger-4 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-center w-16 h-16 bg-brand-yellow/80 rounded-full mb-6 backdrop-blur-sm">
                  <span className="text-3xl font-bold text-gray-900">4</span>
                </div>
                <div className="text-brand-yellow text-sm font-semibold mb-2">STEP 4</div>
                <h3 className="text-xl font-bold mb-3">Ongoing Support</h3>
                <p className="text-purple-100 leading-relaxed">Dedicated account manager. HR, payroll, and compliance fully managed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-reveal">
            <div className="inline-block px-4 py-2 bg-purple-50 rounded-full mb-4">
              <span className="text-sm font-semibold text-brand-purple">SUCCESS STORIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-headline">Real Results from Real Companies</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how businesses save costs and scale faster with Monera
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card className="border border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl animate-slide-left" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🇸🇬</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Singapore SaaS Startup</CardTitle>
                    <CardDescription>Customer Support</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Challenge:</p>
                    <p className="text-gray-700">Needed customer support but local salaries were $3,500/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Solution:</p>
                    <p className="text-gray-700">Hired top-tier CSR at $850/month, fully dedicated and fluent in English</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-green-600">75%</span>
                      <span className="text-gray-600">cost savings</span>
                    </div>
                    <p className="text-sm text-gray-600">Founder now focuses on product development</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-brand-purple hover:shadow-2xl transition-all duration-300 rounded-2xl animate-slide-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🇦🇺</span>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Australian Marketing Agency</CardTitle>
                    <CardDescription>Video Production</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Challenge:</p>
                    <p className="text-gray-700">Couldn't find reliable video editor for TikTok campaigns</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Solution:</p>
                    <p className="text-gray-700">Expert video editor at $1,500/month producing 20+ videos weekly</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-green-600">20+</span>
                      <span className="text-gray-600">videos per week</span>
                    </div>
                    <p className="text-sm text-gray-600">Seamless integration via Slack, zero admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section - Dropdown Style */}
      <section id="faq" ref={faqRef} className="py-12 sm:py-16 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 scroll-reveal">
              <div className="inline-block px-4 py-2 bg-brand-purple/10 rounded-full mb-6 border border-brand-purple/20">
                <span className="text-sm font-semibold text-brand-purple">FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-headline text-gray-900">Got Questions? We've Got Answers.</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about building your remote team with Monera.
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
                  className={`bg-white border border-gray-200 hover:border-brand-purple hover:shadow-xl transition-all duration-300 scroll-reveal-scale stagger-${idx + 1} rounded-2xl overflow-hidden cursor-pointer`}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  <CardHeader className="pb-4 px-4 sm:px-6">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
                      <span>{faq.question}</span>
                      <span className={`text-brand-purple text-2xl transition-transform duration-300 ${openFaqIndex === idx ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </CardTitle>
                  </CardHeader>
                  {openFaqIndex === idx && (
                    <CardContent className="pt-0 pb-6 animate-fade-in">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - KeyGuard Style */}
      <section ref={ctaRef} className="py-12 sm:py-16 md:py-20 text-white relative overflow-hidden" aria-label="Call to action" style={{ background: 'linear-gradient(135deg, #6f03cd 0%, #4a0288 100%)' }}>
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-headline scroll-reveal">
              Ready to Build Your Dream Team?
            </h2>
            <p className="text-xl text-purple-100 mb-10 leading-relaxed scroll-reveal-scale stagger-1">
              Join 100+ companies who trust Monera. <span className="text-brand-yellow font-bold">Get 3 pre-vetted candidates in 48 hours.</span> Zero risk with our 30-day replacement guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center scroll-reveal-scale stagger-2 mb-8">
              {isCalendarExternal ? (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all duration-300 rounded-2xl">
                    Book Free Consultation →
                  </Button>
                </a>
              ) : (
                <Link href={calendarUrl}>
                  <Button size="lg" className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 transition-all duration-300 rounded-2xl">
                    Book Free Consultation →
                  </Button>
                </Link>
              )}
              <Link href="/register">
                <Button size="lg" variant="outline" className="!border-2 !border-white !text-white !bg-white/10 backdrop-blur-md hover:!bg-white/20 font-semibold text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 hover:scale-105 transition-all duration-300 rounded-2xl">
                  Join as Talent
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-purple-200">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5">{customIcons.check}</div>
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5">{customIcons.check}</div>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5">{customIcons.check}</div>
                <span>30-day guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6285161391439'}?text=${process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hi%20Monera,%20I\'m%20interested%20in%20building%20a%20remote%20team'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-3 group"
        aria-label="Contact us on WhatsApp"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="hidden group-hover:block text-sm font-semibold whitespace-nowrap">Chat with us</span>
      </a>
    </>
  )
}







