'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  portfolioUrl: string | null
  linkedInUrl: string | null
  githubUrl: string | null
  videoIntroUrl: string | null
  avatarUrl: string | null
  skills: Skill[]
  workHistory: any[]
  education: any[]
  languages: any[]
  certifications: any[]
}

export default function TalentPublicProfilePage() {
  const params = useParams()
  const userId = params?.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If no userId in params, try to get current user's profile
        const endpoint = userId ? `/api/user/profile/${userId}` : '/api/user/profile'
        const response = await fetch(endpoint, {
          credentials: 'include',
        })
        const data = await response.json()

        if (data.success && data.data) {
          const p = data.data
          const fullName = p.fullName || ''
          const nameParts = fullName.split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          // Fetch experience data
          const experienceRes = await fetch('/api/user/profile/experience', {
            credentials: 'include',
          })
          const experienceData = await experienceRes.json()

          setProfile({
            id: p.id,
            firstName,
            lastName,
            headline: p.headline || p.jobTitle || '',
            bio: p.bio || '',
            location: p.location || '',
            phone: p.phone || '',
            portfolioUrl: p.portfolioUrl || '',
            linkedInUrl: p.linkedInUrl || '',
            githubUrl: p.githubUrl || '',
            videoIntroUrl: p.introVideoUrl || p.videoIntroUrl || '',
            avatarUrl: p.avatarUrl || null,
            skills: p.skills || [],
            workHistory: experienceData.success ? (experienceData.data?.workHistory || []) : [],
            education: experienceData.success ? (experienceData.data?.education || []) : [],
            languages: experienceData.success ? (experienceData.data?.languages || []) : [],
            certifications: experienceData.success ? (experienceData.data?.certifications || []) : [],
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Profile not found</div>
        </div>
      </div>
    )
  }

  const fullName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile.firstName || 'Talent'

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={fullName}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                    unoptimized
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-purple to-purple-700 flex items-center justify-center text-white text-4xl font-semibold">
                    {fullName[0]?.toUpperCase() || 'T'}
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
                {profile.headline && (
                  <p className="text-xl text-gray-600 mb-4">{profile.headline}</p>
                )}
                {profile.location && (
                  <p className="text-gray-500 mb-4">📍 {profile.location}</p>
                )}
                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple hover:text-purple-700 font-medium"
                    >
                      Portfolio
                    </a>
                  )}
                  {profile.linkedInUrl && (
                    <a
                      href={profile.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple hover:text-purple-700 font-medium"
                    >
                      LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple hover:text-purple-700 font-medium"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction Video */}
        {profile.videoIntroUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Introduction Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                {profile.videoIntroUrl.includes('youtube.com') || profile.videoIntroUrl.includes('youtu.be') ? (
                  <iframe
                    src={profile.videoIntroUrl
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'youtube.com/embed/')
                      .replace(/&.*$/, '')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={profile.videoIntroUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Work History */}
        {profile.workHistory && profile.workHistory.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Work History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.workHistory.map((work: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-lg">{work.title} | {work.company}</h3>
                    <p className="text-sm text-gray-600">{work.startDate} - {work.endDate || 'Present'}</p>
                    {work.description && (
                      <p className="text-gray-700 mt-2">{work.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.education.map((edu: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-lg">{edu.institution}</h3>
                    <p className="text-gray-600">{edu.degree} {edu.field && `- ${edu.field}`}</p>
                    {edu.startYear && (
                      <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.languages.map((lang: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-gray-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.certifications.map((cert: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold">{cert.name}</h3>
                    {cert.issuer && (
                      <p className="text-sm text-gray-600">Issued by {cert.issuer}</p>
                    )}
                    {cert.issueDate && (
                      <p className="text-sm text-gray-500">Issued {cert.issueDate}</p>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-purple hover:text-purple-700 text-sm"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  )
}
