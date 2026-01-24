'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    timezone: '',
    experience: '',
    portfolioUrl: '',
  })
  const [skills, setSkills] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [availableSkills, setAvailableSkills] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    // Fetch profile data
    fetch('/api/user/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const profile = data.data
          setFormData({
            fullName: profile.fullName || '',
            country: profile.country || '',
            timezone: profile.timezone || '',
            experience: profile.experience || '',
            portfolioUrl: profile.portfolioUrl || '',
          })
          setSkills(profile.skills || [])
          setSelectedSkills(profile.skills?.map((s: any) => s.id) || [])
        }
      })
      .catch(err => console.error('Failed to fetch profile:', err))
      .finally(() => setLoading(false))

    // Fetch available skills
    fetch('/api/skills', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableSkills(data.data || [])
        }
      })
      .catch(err => console.error('Failed to fetch skills:', err))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          skillIds: selectedSkills,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Profile updated successfully')
        router.refresh()
      } else {
        alert(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone *</Label>
            <Input
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              placeholder="e.g., UTC+7"
              required
            />
          </div>

          <div>
            <Label>Skills *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border p-4 rounded-md mt-2">
              {availableSkills.map((skill) => (
                <label key={skill.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSkills([...selectedSkills, skill.id])
                      } else {
                        setSelectedSkills(selectedSkills.filter(id => id !== skill.id))
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="experience">Experience *</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href="/user/status">
              <Button variant="outline">View Status</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
