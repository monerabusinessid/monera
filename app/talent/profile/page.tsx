'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Footer } from '@/components/footer'

interface Skill {
  id: string
  name: string
}

interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  headline: string | null
  bio: string | null
  location: string | null
  phone: string | null
  hourlyRate: number | null
  availability: string | null
  portfolioUrl: string | null
  linkedInUrl: string | null
  githubUrl: string | null
  videoIntroUrl: string | null
  hoursPerWeek: string | null
  avatarUrl: string | null
  skills: Skill[]
  workHistory: any[]
  education: any[]
  languages: any[]
  certifications: any[]
}

interface Section {
  id: string
  title: string
  completed: boolean
  expanded: boolean
}

export default function TalentProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [skillSearch, setSkillSearch] = useState('')
  const [sections, setSections] = useState<Section[]>([
    { id: 'overview', title: 'Overview', completed: false, expanded: true },
    { id: 'skills', title: 'Skills', completed: false, expanded: false },
    { id: 'portfolio', title: 'Portfolio & Links', completed: false, expanded: true },
    { id: 'work-history', title: 'Work history', completed: false, expanded: false },
    { id: 'education', title: 'Education', completed: false, expanded: false },
    { id: 'languages', title: 'Languages', completed: false, expanded: false },
    { id: 'certifications', title: 'Certifications', completed: false, expanded: false },
  ])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    location: '',
    phone: '',
    hourlyRate: '',
    availability: 'Open',
    hoursPerWeek: '',
    portfolioUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    videoIntroUrl: '',
    skillIds: [] as string[],
    country: '',
    timezone: '',
  })
  const [workHistory, setWorkHistory] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [languages, setLanguages] = useState<any[]>([])
  const [certifications, setCertifications] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showWorkHistoryModal, setShowWorkHistoryModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showCertificationModal, setShowCertificationModal] = useState(false)
  const [editingWorkHistory, setEditingWorkHistory] = useState<any>(null)
  const [editingEducation, setEditingEducation] = useState<any>(null)
  const [editingLanguage, setEditingLanguage] = useState<any>(null)
  const [editingCertification, setEditingCertification] = useState<any>(null)

  const updateProfileCompletion = useCallback((p: any) => {
    const fields = [
      p.firstName, p.lastName, p.headline, p.bio, p.location,
      p.hourlyRate, p.portfolioUrl, p.skills?.length > 0,
      p.workHistory?.length > 0, p.education?.length > 0,
      p.languages?.length > 0
    ]
    const completed = fields.filter(Boolean).length
    const completion = Math.round((completed / fields.length) * 100)
    setProfileCompletion(completion)

    // Update section completion
    setSections(prev => prev.map(section => {
      let completed = false
      switch (section.id) {
        case 'overview':
          completed = !!(p.firstName && p.lastName && p.headline && p.bio)
          break
        case 'skills':
          completed = !!(p.skills?.length > 0)
          break
        case 'portfolio':
          completed = !!(p.portfolioUrl)
          break
        case 'work-history':
          completed = !!(p.workHistory?.length > 0)
          break
        case 'education':
          completed = !!(p.education?.length > 0)
          break
        case 'languages':
          completed = !!(p.languages?.length > 0)
          break
        case 'certifications':
          completed = !!(p.certifications?.length > 0)
          break
      }
      return { ...section, completed }
    }))
  }, [])

  const fetchData = useCallback(async () => {
    try {
      console.log('[Profile] Fetching profile data...')
      const [profileRes, skillsRes, experienceRes] = await Promise.all([
        fetch('/api/user/profile', {
          credentials: 'include',
        }),
        fetch('/api/skills', {
          credentials: 'include',
        }),
        fetch('/api/user/profile/experience', {
          credentials: 'include',
        }),
      ])

      const profileData = await profileRes.json()
      const skillsData = await skillsRes.json()
      const experienceData = await experienceRes.json()

      console.log('[Profile] 🔍 Raw API Response:', {
        profileData: profileData,
        experienceData: experienceData,
      })

      if (profileData.success && profileData.data) {
        const p = profileData.data
        
        console.log('[Profile] 📊 All fields from API:', {
          fullName: p.fullName,
          headline: p.headline,
          jobTitle: p.jobTitle,
          bio: p.bio,
          location: p.location,
          phone: p.phone,
          country: p.country,
          timezone: p.timezone,
          portfolioUrl: p.portfolioUrl,
          linkedInUrl: p.linkedInUrl,
          githubUrl: p.githubUrl,
          introVideoUrl: p.introVideoUrl,
          videoIntroUrl: p.videoIntroUrl,
          avatarUrl: p.avatarUrl,
          skills: p.skills,
        })
        
        // Map data from Supabase format to component format
        const fullName = p.fullName || ''
        // Split fullName into firstName and lastName
        // If fullName is empty, try to get from firstName/lastName if available
        let firstName = ''
        let lastName = ''
        
        if (fullName) {
          const nameParts = fullName.trim().split(/\s+/)
          firstName = nameParts[0] || ''
          lastName = nameParts.slice(1).join(' ') || ''
        } else if (p.firstName || p.lastName) {
          // Fallback: if fullName is empty but firstName/lastName exist
          firstName = p.firstName || ''
          lastName = p.lastName || ''
        }
        
        console.log('[Profile] 🔄 Processing data:', {
          fullName,
          firstName,
          lastName,
          headline: p.headline,
          jobTitle: p.jobTitle,
          bio: p.bio,
          location: p.location,
          phone: p.phone,
          country: p.country,
          timezone: p.timezone,
          introVideoUrl: p.introVideoUrl,
          videoIntroUrl: p.videoIntroUrl,
          hourlyRate: p.hourlyRate,
          availability: p.availability,
          hoursPerWeek: p.hoursPerWeek,
        })
        
        const formDataToSet = {
          firstName: firstName || '',
          lastName: lastName || '',
          headline: p.headline || p.jobTitle || '',
          bio: p.bio || '',
          location: p.location || '',
          phone: p.phone || '',
          hourlyRate: p.hourlyRate ? String(p.hourlyRate) : '',
          availability: p.availability || 'Open',
          hoursPerWeek: p.hoursPerWeek || '',
          portfolioUrl: p.portfolioUrl || '',
          linkedInUrl: p.linkedInUrl || '',
          githubUrl: p.githubUrl || '',
          videoIntroUrl: p.introVideoUrl || p.videoIntroUrl || '',
          skillIds: p.skills?.map((s: Skill) => s.id) || [],
          country: p.country || '',
          timezone: p.timezone || '',
        }
        
        console.log('[Profile] ✅ Setting FormData:', formDataToSet)
        setFormData(formDataToSet)
        
        setProfile({
          id: p.id,
          firstName: firstName,
          lastName: lastName,
          headline: p.headline || p.jobTitle || '',
          bio: p.bio || '',
          location: p.location || '',
          phone: p.phone || '',
          hourlyRate: null,
          availability: null,
          portfolioUrl: p.portfolioUrl || '',
          linkedInUrl: p.linkedInUrl || '',
          githubUrl: p.githubUrl || '',
          videoIntroUrl: p.introVideoUrl || p.videoIntroUrl || '',
          hoursPerWeek: null,
          avatarUrl: p.avatarUrl || null,
          skills: p.skills || [],
          workHistory: experienceData.success ? (experienceData.data?.workHistory || []) : [],
          education: experienceData.success ? (experienceData.data?.education || []) : [],
          languages: experienceData.success ? (experienceData.data?.languages || []) : [],
          certifications: experienceData.success ? (experienceData.data?.certifications || []) : [],
        })
        setAvatarUrl(p.avatarUrl || null)
        
        setFormData({
          firstName: firstName || '',
          lastName: lastName || '',
          headline: p.headline || p.jobTitle || '',
          bio: p.bio || '',
          location: p.location || '',
          phone: p.phone || '',
          hourlyRate: p.hourlyRate ? String(p.hourlyRate) : '',
          availability: p.availability || 'Open',
          hoursPerWeek: p.hoursPerWeek || '',
          portfolioUrl: p.portfolioUrl || '',
          linkedInUrl: p.linkedInUrl || '',
          githubUrl: p.githubUrl || '',
          videoIntroUrl: p.introVideoUrl || p.videoIntroUrl || '',
          skillIds: p.skills?.map((s: Skill) => s.id) || [],
          country: p.country || '',
          timezone: p.timezone || '',
        })
        
        console.log('[Profile] ✅ FormData populated with values:', {
          firstName: firstName || '',
          lastName: lastName || '',
          headline: p.headline || p.jobTitle || '',
          bio: p.bio || '',
          location: p.location || '',
          phone: p.phone || '',
          country: p.country || '',
          timezone: p.timezone || '',
          videoIntroUrl: p.introVideoUrl || p.videoIntroUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          linkedInUrl: p.linkedInUrl || '',
          githubUrl: p.githubUrl || '',
        })
        
        // Load work history, education, languages, certifications from API
        if (experienceData.success && experienceData.data) {
          setWorkHistory(experienceData.data.workHistory || [])
          setEducation(experienceData.data.education || [])
          setLanguages(experienceData.data.languages || [])
          setCertifications(experienceData.data.certifications || [])
        } else {
          setWorkHistory([])
          setEducation([])
          setLanguages([])
          setCertifications([])
        }
        
        // Update profile completion from API
        // Always use API value if available, otherwise calculate
        const apiCompletion = p.profileCompletion
        console.log('[Profile] Profile completion from API:', {
          raw: apiCompletion,
          type: typeof apiCompletion,
          isNumber: typeof apiCompletion === 'number',
          isNull: apiCompletion === null,
          isUndefined: apiCompletion === undefined
        })
        
        if (apiCompletion !== undefined && apiCompletion !== null && !isNaN(Number(apiCompletion))) {
          const completionValue = Number(apiCompletion)
          console.log('[Profile] Using profileCompletion from API:', completionValue, '%')
          setProfileCompletion(Math.round(completionValue))
        } else {
          console.log('[Profile] Calculating profileCompletion from data (API value not available or invalid)')
          updateProfileCompletion({
            firstName,
            lastName,
            headline: p.headline || p.jobTitle,
            bio: p.bio,
            location: p.location,
            phone: p.phone,
            portfolioUrl: p.portfolioUrl,
            linkedInUrl: p.linkedInUrl,
            githubUrl: p.githubUrl,
            videoIntroUrl: p.introVideoUrl,
            skills: p.skills || [],
          })
        }
        
        console.log('[Profile] Profile data loaded successfully:', {
          firstName,
          lastName,
          headline: p.headline || p.jobTitle,
          profileCompletion: p.profileCompletion || 'calculated',
        })
      } else {
        console.warn('[Profile] No profile data received:', profileData)
      }

      if (skillsData.success) {
        setAllSkills(skillsData.data || [])
      }
    } catch (error) {
      console.error('[Profile] Failed to fetch data:', error)
    } finally {
      setLoadingData(false)
    }
  }, [updateProfileCompletion])

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login')
      return
    }
    if (user && user.role === 'TALENT') {
      fetchData()
    }
  }, [user, loading, router, fetchData])

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, expanded: !s.expanded } : s
    ))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setMessage(null)
  }

  const handleSkillToggle = (skillId: string) => {
    if (!formData.skillIds.includes(skillId)) {
      setFormData((prev) => ({
        ...prev,
        skillIds: [...prev.skillIds, skillId],
      }))
      setSkillSearch('')
    }
    setMessage(null)
  }

  const removeSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.filter((id) => id !== skillId),
    }))
  }

  const filteredSkills = allSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !formData.skillIds.includes(skill.id)
  )

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/user/avatar/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setAvatarUrl(data.data.url)
        if (profile) {
          setProfile({ ...profile, avatarUrl: data.data.url })
        }
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
        // Refresh profile data to get updated avatar URL
        fetchData()
      } else {
        console.error('Avatar upload error:', data.error)
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to upload avatar. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Save main profile data
      // Try to get token from localStorage first, fallback to cookie
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const profileResponse = await fetch('/api/profile/candidate', {
        method: 'PUT',
        headers,
        credentials: 'include', // Include cookies for auth-token
        body: JSON.stringify({
          ...formData,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
          skillIds: formData.skillIds.length > 0 ? formData.skillIds : undefined,
        }),
      })

      const profileData = await profileResponse.json()
      
      // Also update talent_profiles.intro_video_url if videoIntroUrl exists
      if (formData.videoIntroUrl && formData.videoIntroUrl.trim() !== '') {
        try {
          const updateVideoResponse = await fetch('/api/user/profile/video', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              videoIntroUrl: formData.videoIntroUrl.trim(),
            }),
          })
          const updateVideoData = await updateVideoResponse.json()
          console.log('[Profile] Video URL update result:', updateVideoData)
        } catch (error) {
          console.error('[Profile] Error updating video URL:', error)
        }
      }

      // Save work history, education, languages, certifications
      const experienceResponse = await fetch('/api/user/profile/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          workHistory,
          education,
          languages,
          certifications,
        }),
      })

      const experienceData = await experienceResponse.json()

      if (profileData.success && experienceData.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully!' })
        if (profileData.data) {
          setProfile(profileData.data)
          updateProfileCompletion(profileData.data)
        }
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: profileData.error || experienceData.error || 'Failed to save profile' })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Handler functions for modals
  const handleSaveWorkHistory = (work: any) => {
    if (editingWorkHistory) {
      setWorkHistory(prev => prev.map((w, idx) => 
        idx === workHistory.indexOf(editingWorkHistory) ? work : w
      ))
    } else {
      setWorkHistory(prev => [...prev, work])
    }
    setShowWorkHistoryModal(false)
    setEditingWorkHistory(null)
  }

  const handleDeleteWorkHistory = (index: number) => {
    setWorkHistory(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSaveEducation = (edu: any) => {
    if (editingEducation) {
      // Find index of editing education
      const editIndex = education.findIndex((e, idx) => 
        e === editingEducation || 
        (e.institution === editingEducation.institution && e.degree === editingEducation.degree)
      )
      if (editIndex !== -1) {
        setEducation(prev => prev.map((e, idx) => idx === editIndex ? edu : e))
      }
    } else {
      setEducation(prev => [...prev, edu])
    }
    setShowEducationModal(false)
    setEditingEducation(null)
  }

  const handleDeleteEducation = (index: number) => {
    setEducation(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSaveLanguage = (lang: any) => {
    if (editingLanguage) {
      // Find index of editing language
      const editIndex = languages.findIndex((l, idx) => 
        l === editingLanguage || 
        (l.name === editingLanguage.name && l.proficiency === editingLanguage.proficiency)
      )
      if (editIndex !== -1) {
        setLanguages(prev => prev.map((l, idx) => idx === editIndex ? lang : l))
      }
    } else {
      setLanguages(prev => [...prev, lang])
    }
    setShowLanguageModal(false)
    setEditingLanguage(null)
  }

  const handleDeleteLanguage = (index: number) => {
    setLanguages(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSaveCertification = (cert: any) => {
    if (editingCertification) {
      // Find index of editing certification
      const editIndex = certifications.findIndex((c, idx) => 
        c === editingCertification || 
        (c.name === editingCertification.name && c.issuer === editingCertification.issuer)
      )
      if (editIndex !== -1) {
        setCertifications(prev => prev.map((c, idx) => idx === editIndex ? cert : c))
      }
    } else {
      setCertifications(prev => [...prev, cert])
    }
    setShowCertificationModal(false)
    setEditingCertification(null)
  }

  const handleDeleteCertification = (index: number) => {
    setCertifications(prev => prev.filter((_, idx) => idx !== index))
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'TALENT') {
    return null
  }

  const fullName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Profile Preview Header */}
      <div className="bg-white border-b rounded-b-2xl overflow-hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
                    unoptimized
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-brand-purple flex items-center justify-center text-white text-2xl font-bold">
                    {fullName[0].toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-brand-purple text-white rounded-full p-1.5 cursor-pointer hover:bg-purple-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-gray-600">{profile?.headline || 'Complete your profile'}</p>
                {profile?.location && (
                  <p className="text-sm text-gray-500">{profile.location}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/talent/profile/public${user?.id ? `?id=${user.id}` : ''}`} target="_blank">
                <Button variant="outline">See public view</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Completion Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-purple mb-2">{profileCompletion}%</div>
                  <p className="text-sm text-gray-600 mb-4">Profile completion</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-brand-purple h-2 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  {profileCompletion < 100 && (
                    <p className="text-xs text-gray-500">
                      Complete your profile to get more job opportunities
                    </p>
                  )}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Introduction Video</p>
                    <button
                      onClick={() => {
                        // Scroll to video input in overview section
                        const overviewSection = document.getElementById('overview-section')
                        if (overviewSection) {
                          overviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          // Expand overview section if collapsed
                          const overviewExpanded = sections.find(s => s.id === 'overview')?.expanded
                          if (!overviewExpanded) {
                            toggleSection('overview')
                          }
                          // Focus on video input after a short delay
                          setTimeout(() => {
                            const videoInput = document.getElementById('videoIntroUrl')
                            if (videoInput) {
                              videoInput.focus()
                              videoInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }
                          }, 300)
                        }
                      }}
                      className="text-xs text-brand-purple hover:text-purple-700 font-medium"
                    >
                      {profile?.videoIntroUrl ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {profile?.videoIntroUrl || formData.videoIntroUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      {(() => {
                        const videoUrl = profile?.videoIntroUrl || formData.videoIntroUrl || ''
                        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                          const embedUrl = videoUrl
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'youtube.com/embed/')
                            .replace(/&.*$/, '') // Remove query params
                          return (
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )
                        } else {
                          return (
                            <video
                              src={videoUrl}
                              controls
                              className="w-full h-full"
                            />
                          )
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No video added</p>
                        <button
                          onClick={() => {
                            const overviewSection = document.getElementById('overview-section')
                            if (overviewSection) {
                              overviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              const overviewExpanded = sections.find(s => s.id === 'overview')?.expanded
                              if (!overviewExpanded) {
                                toggleSection('overview')
                              }
                              setTimeout(() => {
                                const videoInput = document.getElementById('videoIntroUrl')
                                if (videoInput) {
                                  videoInput.focus()
                                  videoInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }
                              }, 300)
                            }
                          }}
                          className="mt-2 text-xs text-brand-purple hover:text-purple-700 font-medium"
                        >
                          Add video
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/talent/dashboard" className="block text-sm text-gray-600 hover:text-brand-purple">
                  Dashboard
                </Link>
                <Link href="/talent/jobs" className="block text-sm text-gray-600 hover:text-brand-purple">
                  Browse Jobs
                </Link>
                <Link href="/talent/applications" className="block text-sm text-gray-600 hover:text-brand-purple">
                  My Applications
                </Link>
                <Link href="/talent/messages" className="block text-sm text-gray-600 hover:text-brand-purple">
                  Messages
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Overview Section */}
            <Card className="mb-6" id="overview-section">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Overview</CardTitle>
                    {sections.find(s => s.id === 'overview')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSection('overview')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'overview')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'overview')?.expanded && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      placeholder="e.g., Senior Frontend Developer | React & TypeScript Specialist"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.headline.length}/100 characters
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tip: Include your role, key skills, or specialization to stand out
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio / About</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={5}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/1000 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        placeholder="UTC-5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        placeholder="50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="availability">Availability</Label>
                      <Select
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={(e) => handleChange(e as any)}
                      >
                        <option value="Open">Open</option>
                        <option value="Busy">Busy</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="hoursPerWeek">Hours per week</Label>
                    <Select
                      id="hoursPerWeek"
                      name="hoursPerWeek"
                      value={formData.hoursPerWeek}
                      onChange={(e) => handleChange(e as any)}
                    >
                      <option value="">Select...</option>
                      <option value="More than 30 hrs/week">More than 30 hrs/week</option>
                      <option value="Less than 30 hrs/week">Less than 30 hrs/week</option>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Skills Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Skills</CardTitle>
                    {sections.find(s => s.id === 'skills')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSection('skills')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'skills')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'skills')?.expanded && (
                <CardContent className="space-y-4">
                  {/* Selected Skills */}
                  {formData.skillIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skillIds.map((skillId) => {
                        const skill = allSkills.find(s => s.id === skillId)
                        return skill ? (
                          <span
                            key={skillId}
                            className="px-3 py-1 bg-brand-purple text-white rounded-full text-sm flex items-center gap-2"
                          >
                            {skill.name}
                            <button
                              onClick={() => removeSkill(skillId)}
                              className="hover:bg-purple-700 rounded-full p-0.5"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                  )}

                  {/* Skill Search */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search and add skills..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="pr-10"
                    />
                    <svg
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Skill Suggestions */}
                  {skillSearch && filteredSkills.length > 0 && (
                    <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                      {filteredSkills.slice(0, 10).map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillToggle(skill.id)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* All Skills (when no search) */}
                  {!skillSearch && (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                      {allSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillToggle(skill.id)}
                          disabled={formData.skillIds.includes(skill.id)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.skillIds.includes(skill.id)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Portfolio Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Portfolio & Links</CardTitle>
                    {sections.find(s => s.id === 'portfolio')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSection('portfolio')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'portfolio')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'portfolio')?.expanded && (
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                      <Input
                        id="linkedInUrl"
                        name="linkedInUrl"
                        type="url"
                        value={formData.linkedInUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        name="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="videoIntroUrl" className="text-base font-semibold">Video Introduction URL</Label>
                    <p className="text-xs text-gray-500 mb-2">Paste a YouTube URL or Supabase Storage video URL</p>
                    <Input
                      id="videoIntroUrl"
                      name="videoIntroUrl"
                      type="url"
                      value={formData.videoIntroUrl}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=... or https://yourproject.supabase.co/storage/v1/object/public/intro-videos/..."
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500 mb-3">
                      <strong>For Supabase Storage videos:</strong> Copy the public URL from Storage → intro-videos bucket. Format: https://yourproject.supabase.co/storage/v1/object/public/intro-videos/{'{user_id}'}/intro-video.mp4
                    </p>
                    {formData.videoIntroUrl && (
                      <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-gray-100 border">
                        {formData.videoIntroUrl.includes('youtube.com') || formData.videoIntroUrl.includes('youtu.be') ? (
                          <iframe
                            src={formData.videoIntroUrl
                              .replace('watch?v=', 'embed/')
                              .replace('youtu.be/', 'youtube.com/embed/')
                              .replace(/&.*$/, '')}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={formData.videoIntroUrl}
                            controls
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Work History Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Work history</CardTitle>
                    {sections.find(s => s.id === 'work-history')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingWorkHistory(null); setShowWorkHistoryModal(true); }}>+ Add</Button>
                    <button
                      onClick={() => toggleSection('work-history')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'work-history')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'work-history')?.expanded && (
                <CardContent>
                  {workHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No work history yet</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => { setEditingWorkHistory(null); setShowWorkHistoryModal(true); }}>Add work history</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workHistory.map((work, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{work.title} | {work.company}</h4>
                              <p className="text-sm text-gray-600">{work.startDate} - {work.endDate || 'Present'}</p>
                              {work.description && (
                                <p className="text-sm text-gray-700 mt-2">{work.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => { setEditingWorkHistory(work); setShowWorkHistoryModal(true); }}
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="text-red-400 hover:text-red-600"
                                onClick={() => handleDeleteWorkHistory(idx)}
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Education Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Education</CardTitle>
                    {sections.find(s => s.id === 'education')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingEducation(null); setShowEducationModal(true); }}>+ Add</Button>
                    <button
                      onClick={() => toggleSection('education')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'education')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'education')?.expanded && (
                <CardContent>
                  {education.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No education added yet</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => { setEditingEducation(null); setShowEducationModal(true); }}>Add education</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {education.map((edu, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{edu.institution}</h4>
                              <p className="text-sm text-gray-600">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                              {edu.startYear && (
                                <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => { setEditingEducation(edu); setShowEducationModal(true); }}
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="text-red-400 hover:text-red-600"
                                onClick={() => handleDeleteEducation(idx)}
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Languages Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Languages</CardTitle>
                    {sections.find(s => s.id === 'languages')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingLanguage(null); setShowLanguageModal(true); }}>+ Add</Button>
                    <button
                      onClick={() => toggleSection('languages')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'languages')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'languages')?.expanded && (
                <CardContent>
                  {languages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No languages added yet</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => { setEditingLanguage(null); setShowLanguageModal(true); }}>Add language</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {languages.map((lang, idx) => (
                        <div key={idx} className="flex justify-between items-center border rounded-lg p-3">
                          <div>
                            <span className="font-medium">{lang.name}</span>
                            <span className="text-sm text-gray-600 ml-2">- {lang.proficiency}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => { setEditingLanguage(lang); setShowLanguageModal(true); }}
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-600"
                              onClick={() => handleDeleteLanguage(idx)}
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Certifications Section */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>Certifications</CardTitle>
                    {sections.find(s => s.id === 'certifications')?.completed && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingCertification(null); setShowCertificationModal(true); }}>+ Add</Button>
                    <button
                      onClick={() => toggleSection('certifications')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className={`w-5 h-5 transition-transform ${sections.find(s => s.id === 'certifications')?.expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </CardHeader>
              {sections.find(s => s.id === 'certifications')?.expanded && (
                <CardContent>
                  {certifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No certifications added yet</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => { setEditingCertification(null); setShowCertificationModal(true); }}>Add certification</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{cert.name}</h4>
                              {cert.issuer && (
                                <p className="text-sm text-gray-600">Issued by {cert.issuer}</p>
                              )}
                              {cert.issueDate && (
                                <p className="text-sm text-gray-500">Issued {cert.issueDate}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => { setEditingCertification(cert); setShowCertificationModal(true); }}
                                title="Edit"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                className="text-red-400 hover:text-red-600"
                                onClick={() => handleDeleteCertification(idx)}
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4 mb-8">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-brand-purple hover:bg-purple-700">
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Work History Modal */}
      {showWorkHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingWorkHistory ? 'Edit Work History' : 'Add Work History'}</h3>
            <WorkHistoryForm
              work={editingWorkHistory}
              onSave={handleSaveWorkHistory}
              onCancel={() => { setShowWorkHistoryModal(false); setEditingWorkHistory(null); }}
            />
          </div>
        </div>
      )}

      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingEducation ? 'Edit Education' : 'Add Education'}</h3>
            <EducationForm
              education={editingEducation}
              onSave={handleSaveEducation}
              onCancel={() => { setShowEducationModal(false); setEditingEducation(null); }}
            />
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingLanguage ? 'Edit Language' : 'Add Language'}</h3>
            <LanguageForm
              language={editingLanguage}
              onSave={handleSaveLanguage}
              onCancel={() => { setShowLanguageModal(false); setEditingLanguage(null); }}
            />
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertificationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingCertification ? 'Edit Certification' : 'Add Certification'}</h3>
            <CertificationForm
              certification={editingCertification}
              onSave={handleSaveCertification}
              onCancel={() => { setShowCertificationModal(false); setEditingCertification(null); }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Work History Form Component
function WorkHistoryForm({ work, onSave, onCancel }: { work: any, onSave: (work: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: work?.title || '',
    company: work?.company || '',
    startDate: work?.startDate || '',
    endDate: work?.endDate || '',
    description: work?.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            placeholder="March 2022"
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            placeholder="Present or March 2024"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

// Education Form Component
function EducationForm({ education, onSave, onCancel }: { education: any, onSave: (edu: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    degree: education?.degree || '',
    field: education?.field || '',
    startYear: education?.startYear || '',
    endYear: education?.endYear || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      startYear: formData.startYear ? parseInt(formData.startYear) : null,
      endYear: formData.endYear ? parseInt(formData.endYear) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="institution">Institution</Label>
        <Input
          id="institution"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="degree">Degree</Label>
        <Input
          id="degree"
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="field">Field of Study</Label>
        <Input
          id="field"
          value={formData.field}
          onChange={(e) => setFormData({ ...formData, field: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startYear">Start Year</Label>
          <Input
            id="startYear"
            type="number"
            value={formData.startYear}
            onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="endYear">End Year</Label>
          <Input
            id="endYear"
            type="number"
            value={formData.endYear}
            onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

// Language Form Component
function LanguageForm({ language, onSave, onCancel }: { language: any, onSave: (lang: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: language?.name || '',
    proficiency: language?.proficiency || 'Fluent',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Language</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="proficiency">Proficiency</Label>
        <select
          id="proficiency"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.proficiency}
          onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
        >
          <option value="Native">Native</option>
          <option value="Fluent">Fluent</option>
          <option value="Conversational">Conversational</option>
          <option value="Basic">Basic</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

// Certification Form Component
function CertificationForm({ certification, onSave, onCancel }: { certification: any, onSave: (cert: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: certification?.name || '',
    issuer: certification?.issuer || '',
    issueDate: certification?.issueDate || '',
    expiryDate: certification?.expiryDate || '',
    credentialUrl: certification?.credentialUrl || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Certification Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="issuer">Issuing Organization</Label>
        <Input
          id="issuer"
          value={formData.issuer}
          onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
            placeholder="March 2022"
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            placeholder="March 2025"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="credentialUrl">Credential URL</Label>
        <Input
          id="credentialUrl"
          type="url"
          value={formData.credentialUrl}
          onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}
