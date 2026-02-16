'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TalentProfileFormProps {
  initialData?: any
  onSave: (data: any) => Promise<void>
  loading?: boolean
}

export function TalentProfileForm({ initialData, onSave, loading }: TalentProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    bio: '',
    location: '',
    phone: '',
    hourlyRate: '',
    availability: 'Open',
    portfolioUrl: '',
    linkedInUrl: '',
    githubUrl: '',
    hoursPerWeek: 'More than 30 hrs/week',
    skills: [] as string[],
    workHistory: [] as any[],
    education: [] as any[],
    languages: [] as any[],
    certifications: [] as any[]
  })

  const [availableSkills, setAvailableSkills] = useState<any[]>([])
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        headline: initialData.headline || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        phone: initialData.phone || '',
        hourlyRate: initialData.hourlyRate?.toString() || '',
        availability: initialData.availability || 'Open',
        portfolioUrl: initialData.portfolioUrl || '',
        linkedInUrl: initialData.linkedInUrl || '',
        githubUrl: initialData.githubUrl || '',
        hoursPerWeek: initialData.hoursPerWeek || 'More than 30 hrs/week',
        skills: initialData.skills?.map((s: any) => s.id) || [],
        workHistory: initialData.workHistory || [],
        education: initialData.education || [],
        languages: initialData.languages || [],
        certifications: initialData.certifications || []
      })
    }
  }, [initialData])

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      if (data.success) {
        setAvailableSkills(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addWorkHistory = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, {
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }))
  }

  const updateWorkHistory = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeWorkHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: ''
      }]
    }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, {
        name: '',
        proficiency: 'Conversational'
      }]
    }))
  }

  const updateLanguage = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const addSkill = (skillId: string) => {
    if (!formData.skills.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillId]
      }))
    }
  }

  const removeSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(id => id !== skillId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Professional Headline *</label>
            <Input
              placeholder="e.g. Senior Frontend Developer"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio *</label>
            <Textarea
              placeholder="Tell us about your experience and expertise..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
              <Input
                type="number"
                placeholder="50"
                value={formData.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Availability</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
              >
                <option value="Open">Open to work</option>
                <option value="Busy">Currently busy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hours per Week</label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.hoursPerWeek}
              onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
            >
              <option value="More than 30 hrs/week">More than 30 hrs/week</option>
              <option value="Less than 30 hrs/week">Less than 30 hrs/week</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Portfolio URL</label>
            <Input
              type="url"
              placeholder="https://yourportfolio.com"
              value={formData.portfolioUrl}
              onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
            <Input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedInUrl}
              onChange={(e) => handleInputChange('linkedInUrl', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">GitHub URL</label>
            <Input
              type="url"
              placeholder="https://github.com/yourusername"
              value={formData.githubUrl}
              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Add Skills</label>
            <select
              className="w-full p-2 border rounded-md"
              onChange={(e) => {
                if (e.target.value) {
                  addSkill(e.target.value)
                  e.target.value = ''
                }
              }}
            >
              <option value="">Select a skill</option>
              {availableSkills
                .filter(skill => !formData.skills.includes(skill.id))
                .map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))
              }
            </select>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skillId => {
                const skill = availableSkills.find(s => s.id === skillId)
                return skill ? (
                  <span
                    key={skillId}
                    className="bg-brand-purple text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkill(skillId)}
                      className="hover:bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Work History
            <Button type="button" onClick={addWorkHistory} size="sm">
              Add Experience
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.workHistory.map((work, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Experience #{index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeWorkHistory(index)}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title</label>
                  <Input
                    value={work.title}
                    onChange={(e) => updateWorkHistory(index, 'title', e.target.value)}
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    value={work.company}
                    onChange={(e) => updateWorkHistory(index, 'company', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    value={work.startDate}
                    onChange={(e) => updateWorkHistory(index, 'startDate', e.target.value)}
                    placeholder="March 2022"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    value={work.endDate}
                    onChange={(e) => updateWorkHistory(index, 'endDate', e.target.value)}
                    placeholder="Present or March 2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={work.description}
                  onChange={(e) => updateWorkHistory(index, 'description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Education
            <Button type="button" onClick={addEducation} size="sm">
              Add Education
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.education.map((edu, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Education #{index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeEducation(index)}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Institution</label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Degree</label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Bachelor's, Master's, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Field of Study</label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Years</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={edu.startYear}
                      onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                      placeholder="2018"
                    />
                    <Input
                      type="number"
                      value={edu.endYear}
                      onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                      placeholder="2022"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Languages
            <Button type="button" onClick={addLanguage} size="sm">
              Add Language
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.languages.map((lang, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Language</label>
                <Input
                  value={lang.name}
                  onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                  placeholder="English"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Proficiency</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
              <Button
                type="button"
                onClick={() => removeLanguage(index)}
                variant="outline"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}