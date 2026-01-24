'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function LandingPageAdmin() {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'companies' | 'talent-categories' | 'faqs' | 'header'>('header')
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [talentCategories, setTalentCategories] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadProgressLogo, setUploadProgressLogo] = useState(0)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadProgressAvatar, setUploadProgressAvatar] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})

  const fetchHeaderSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/landing/settings?t=' + Date.now(), {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data.success) {
        console.log('Header settings fetched:', data.data)
        setHeaderSettings(data.data || {})
      } else {
        console.error('Failed to fetch header settings:', data.error)
      }
    } catch (error) {
      console.error('Error fetching header settings:', error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'testimonials') {
        const res = await fetch('/api/landing/testimonials')
        const data = await res.json()
        if (data.success) setTestimonials(data.data || [])
      } else if (activeTab === 'companies') {
        const res = await fetch('/api/landing/companies')
        const data = await res.json()
        if (data.success) setCompanies(data.data || [])
      } else if (activeTab === 'talent-categories') {
        const res = await fetch('/api/landing/talent-categories')
        const data = await res.json()
        if (data.success) setTalentCategories(data.data || [])
      } else if (activeTab === 'faqs') {
        const res = await fetch('/api/landing/faqs')
        const data = await res.json()
        if (data.success) setFaqs(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
    if (activeTab === 'header') {
      fetchHeaderSettings()
    }
  }, [activeTab, fetchData, fetchHeaderSettings])

  const handleEdit = (item: any) => {
    setEditing(item.id)
    setFormData(item)
  }

  const handleSave = async () => {
    try {
      let endpoint = ''
      let method = 'POST'
      const isEdit = editing && editing !== 'new'
      
      if (activeTab === 'testimonials') {
        endpoint = '/api/landing/testimonials'
        if (isEdit) method = 'PUT'
      } else if (activeTab === 'companies') {
        endpoint = '/api/landing/companies'
        if (isEdit) method = 'PUT'
      } else if (activeTab === 'talent-categories') {
        endpoint = '/api/landing/talent-categories'
        if (isEdit) method = 'PUT'
      } else if (activeTab === 'faqs') {
        endpoint = '/api/landing/faqs'
        if (isEdit) method = 'PUT'
      }

      // Only include id if it's a real edit (not 'new')
      const body = isEdit ? { id: editing, ...formData } : formData
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (data.success) {
        setEditing(null)
        setFormData({})
        fetchData()
        alert('Saved successfully!')
      } else {
        alert('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error saving:', error)
      alert('Error saving data: ' + (error.message || 'Unknown error'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      let endpoint = ''
      if (activeTab === 'testimonials') endpoint = '/api/landing/testimonials'
      else if (activeTab === 'companies') endpoint = '/api/landing/companies'
      else if (activeTab === 'talent-categories') endpoint = '/api/landing/talent-categories'
      else if (activeTab === 'faqs') endpoint = '/api/landing/faqs'

      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        fetchData()
        alert('Deleted successfully!')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error deleting data')
    }
  }

  const handleNew = () => {
    setEditing('new')
    if (activeTab === 'testimonials') {
      setFormData({ name: '', role: '', content: '', avatar: '👤', type: 'CLIENT', display_order: 0 })
    } else if (activeTab === 'companies') {
      setFormData({ name: '', logo: '', display_order: 0 })
    } else if (activeTab === 'talent-categories') {
      setFormData({ name: '', icon: '', count: '', display_order: 0 })
    } else if (activeTab === 'faqs') {
      setFormData({ question: '', answer: '', display_order: 0 })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Landing Page Content Management</h1>
        <p className="text-gray-600">Manage testimonials, companies, talent categories, and FAQs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['header', 'testimonials', 'companies', 'talent-categories', 'faqs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-purple text-brand-purple'
                : 'border-transparent text-gray-600 hover:text-brand-purple'
            }`}
          >
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Add New Button - Hide for header tab */}
      {activeTab !== 'header' && (
        <div className="mb-6">
          <Button onClick={handleNew} className="bg-brand-purple hover:bg-purple-700">
            + Add New
          </Button>
        </div>
      )}

      {/* Header Settings Form */}
      {activeTab === 'header' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Header Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Hero Image</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      setUploading(true)
                      setUploadProgress(0)

                      try {
                        const formData = new FormData()
                        formData.append('file', file)

                        const res = await fetch('/api/landing/upload-image', {
                          method: 'POST',
                          body: formData,
                        })

                        const data = await res.json()
                        if (data.success) {
                          setHeaderSettings({ ...headerSettings, hero_image_url: data.data.url })
                          alert('Image uploaded successfully!')
                        } else {
                          alert('Error: ' + data.error)
                        }
                      } catch (error) {
                        console.error('Error uploading image:', error)
                        alert('Error uploading image')
                      } finally {
                        setUploading(false)
                        setUploadProgress(0)
                        // Reset file input
                        e.target.value = ''
                      }
                    }}
                    disabled={uploading}
                    className="flex-1"
                  />
                </div>
                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                <Input
                  value={headerSettings.hero_image_url || ''}
                  onChange={(e) => setHeaderSettings({ ...headerSettings, hero_image_url: e.target.value })}
                  placeholder="Atau masukkan URL gambar manual"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500">Upload gambar (JPEG, PNG, WebP, GIF - max 5MB) atau masukkan URL manual.</p>
              </div>
              {headerSettings.hero_image_url && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-semibold">Preview Hero Image</Label>
                  <div className="relative bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <Image
                      src={headerSettings.hero_image_url}
                      alt="Hero preview"
                      width={640}
                      height={360}
                      className="w-full max-w-md mx-auto h-auto object-contain rounded-lg shadow-lg"
                      style={{
                        width: headerSettings.hero_image_width || '100%',
                        height: headerSettings.hero_image_height || 'auto',
                        objectFit: headerSettings.hero_image_object_fit || 'cover',
                        borderRadius: headerSettings.hero_image_border_radius || '24px',
                        opacity: parseFloat(headerSettings.hero_image_opacity || '1'),
                        objectPosition: headerSettings.hero_image_position || 'center',
                        maxHeight: '400px'
                      }}
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Preview akan terlihat seperti ini di landing page
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label>Hero Title (SEO-friendly)</Label>
              <Input
                value={headerSettings.hero_title || ''}
                onChange={(e) => setHeaderSettings({ ...headerSettings, hero_title: e.target.value })}
                placeholder="Hire Vetted Remote Talent | Premium Talent Marketplace"
              />
              <p className="text-xs text-gray-500 mt-1">Contoh: "Hire Vetted Remote Talent | Premium Talent Marketplace"</p>
            </div>
            <div>
              <Label>Hero Subtitle (SEO-friendly)</Label>
              <Input
                value={headerSettings.hero_subtitle || ''}
                onChange={(e) => setHeaderSettings({ ...headerSettings, hero_subtitle: e.target.value })}
                placeholder="Quality-First Freelance Platform | Pre-Vetted Remote Talent"
              />
              <p className="text-xs text-gray-500 mt-1">Contoh: "Quality-First Freelance Platform | Pre-Vetted Remote Talent"</p>
            </div>
            <div>
              <Label>Hero Description (SEO-friendly)</Label>
              <Textarea
                value={headerSettings.hero_description || ''}
                onChange={(e) => setHeaderSettings({ ...headerSettings, hero_description: e.target.value })}
                rows={4}
                placeholder="Connect with pre-screened remote talent ready to deliver quality work. AI-powered matching, vetted professionals, no unqualified applicants."
              />
              <p className="text-xs text-gray-500 mt-1">Gunakan kata kunci: remote talent, vetted talent, pre-screened professionals, quality work</p>
            </div>

            {/* Image Settings */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Image Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Width</Label>
                  <Input
                    value={headerSettings.hero_image_width || '100%'}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, hero_image_width: e.target.value })}
                    placeholder="100%"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contoh: 100%, 800px, 50rem</p>
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    value={headerSettings.hero_image_height || 'auto'}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, hero_image_height: e.target.value })}
                    placeholder="auto"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contoh: auto, 600px, 50vh</p>
                </div>
                <div>
                  <Label>Object Fit</Label>
                  <Select
                    value={headerSettings.hero_image_object_fit || 'cover'}
                    onValueChange={(value) => setHeaderSettings({ ...headerSettings, hero_image_object_fit: value })}
                  >
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="scale-down">Scale Down</SelectItem>
                  </Select>
                </div>
                <div>
                  <Label>Border Radius</Label>
                  <Input
                    value={headerSettings.hero_image_border_radius || '24px'}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, hero_image_border_radius: e.target.value })}
                    placeholder="24px"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contoh: 24px, 1rem, 50%</p>
                </div>
                <div>
                  <Label>Opacity (0-1)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={headerSettings.hero_image_opacity || '1'}
                    onChange={(e) => setHeaderSettings({ ...headerSettings, hero_image_opacity: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Select
                    value={headerSettings.hero_image_position || 'center'}
                    onValueChange={(value) => setHeaderSettings({ ...headerSettings, hero_image_position: value })}
                  >
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </Select>
                </div>
                <div>
                  <Label>Alignment</Label>
                  <Select
                    value={headerSettings.hero_image_alignment || 'center'}
                    onValueChange={(value) => setHeaderSettings({ ...headerSettings, hero_image_alignment: value })}
                  >
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  try {
                    console.log('Saving header settings:', headerSettings)
                    
                    // Save all settings with better error handling
                    const results = await Promise.allSettled(
                      Object.entries(headerSettings).map(async ([key, value]) => {
                        const res = await fetch('/api/landing/settings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key, value: value || '' })
                        })
                        const data = await res.json()
                        if (!data.success) {
                          console.error(`Error saving ${key}:`, data.error)
                          throw new Error(`Failed to save ${key}: ${data.error}`)
                        }
                        return { key, success: true }
                      })
                    )
                    
                    // Check for failures
                    const failures = results.filter(r => r.status === 'rejected')
                    if (failures.length > 0) {
                      console.error('Some settings failed to save:', failures)
                      alert(`Error: Some settings failed to save. Check console for details.`)
                      return
                    }
                    
                    console.log('All header settings saved successfully')
                    alert('Header settings saved successfully!')
                    
                    // Fetch updated settings
                    await fetchHeaderSettings()
                    
                    // Force refresh after a short delay to ensure data is updated
                    setTimeout(() => {
                      window.location.reload()
                    }, 1000)
                  } catch (error: any) {
                    console.error('Error saving header settings:', error)
                    alert(`Error saving header settings: ${error.message || 'Unknown error'}`)
                  }
                }}
                className="bg-brand-purple hover:bg-purple-700"
              >
                Save Header Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form for Editing/Creating */}
      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing === 'new' ? 'Add New' : 'Edit'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === 'testimonials' && (
              <>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Avatar (Image or Emoji)</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          setUploadingAvatar(true)
                          setUploadProgressAvatar(0)

                          try {
                            const uploadFormData = new FormData()
                            uploadFormData.append('file', file)

                            const res = await fetch('/api/landing/upload-image', {
                              method: 'POST',
                              body: uploadFormData,
                            })

                            const data = await res.json()
                            if (data.success) {
                              setFormData({ ...formData, avatar: data.data.url })
                              alert('Avatar uploaded successfully!')
                            } else {
                              alert('Error: ' + data.error)
                            }
                          } catch (error) {
                            console.error('Error uploading avatar:', error)
                            alert('Error uploading avatar')
                          } finally {
                            setUploadingAvatar(false)
                            setUploadProgressAvatar(0)
                            e.target.value = ''
                          }
                        }}
                        disabled={uploadingAvatar}
                        className="flex-1"
                      />
                    </div>
                    {uploadingAvatar && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgressAvatar}%` }}
                        ></div>
                      </div>
                    )}
                    <Input
                      value={formData.avatar || ''}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="Upload image atau masukkan emoji (contoh: 👤)"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500">Upload gambar avatar (JPEG, PNG, WebP, GIF - max 5MB) atau masukkan emoji.</p>
                  </div>
                  {formData.avatar && (formData.avatar.startsWith('http') || formData.avatar.startsWith('/')) && (
                    <div className="mt-4">
                      <Image
                        src={formData.avatar}
                        alt="Avatar preview"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-full border-2 border-gray-200"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type || 'CLIENT'}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="TALENT">Talent</SelectItem>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            {activeTab === 'companies' && (
              <>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Logo</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          setUploadingLogo(true)
                          setUploadProgressLogo(0)

                          try {
                            const uploadFormData = new FormData()
                            uploadFormData.append('file', file)

                            const res = await fetch('/api/landing/upload-image', {
                              method: 'POST',
                              body: uploadFormData,
                            })

                            const data = await res.json()
                            if (data.success) {
                              setFormData({ ...formData, logo: data.data.url })
                              alert('Logo uploaded successfully!')
                            } else {
                              alert('Error: ' + data.error)
                            }
                          } catch (error) {
                            console.error('Error uploading logo:', error)
                            alert('Error uploading logo')
                          } finally {
                            setUploadingLogo(false)
                            setUploadProgressLogo(0)
                            e.target.value = ''
                          }
                        }}
                        disabled={uploadingLogo}
                        className="flex-1"
                      />
                    </div>
                    {uploadingLogo && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgressLogo}%` }}
                        ></div>
                      </div>
                    )}
                    <Input
                      value={formData.logo || ''}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="Atau masukkan URL logo manual"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500">Upload gambar logo (JPEG, PNG, WebP, GIF, SVG - max 5MB) atau masukkan URL manual.</p>
                  </div>
                  {formData.logo && (
                    <div className="mt-4">
                      <Image
                        src={formData.logo}
                        alt="Logo preview"
                        width={240}
                        height={96}
                        className="max-w-xs h-24 object-contain rounded-lg border"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            {activeTab === 'talent-categories' && (
              <>
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Icon (Emoji)</Label>
                  <Input
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="💻"
                  />
                </div>
                <div>
                  <Label>Count</Label>
                  <Input
                    value={formData.count || ''}
                    onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                    placeholder="500+"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            {activeTab === 'faqs' && (
              <>
                <div>
                  <Label>Question</Label>
                  <Input
                    value={formData.question || ''}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={formData.answer || ''}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-brand-purple hover:bg-purple-700">
                Save
              </Button>
              <Button variant="outline" onClick={() => { setEditing(null); setFormData({}) }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {activeTab === 'testimonials' && testimonials.map((item) => {
            const isAvatarImage = item.avatar && (item.avatar.startsWith('http') || item.avatar.startsWith('/'))
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isAvatarImage ? (
                          <Image
                            src={item.avatar}
                            alt={item.name || 'Avatar'}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            unoptimized
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{item.avatar || '👤'}</span>
                        )}
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.role} ({item.type})</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{item.content}</p>
                      <p className="text-xs text-gray-500">Order: {item.display_order}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {activeTab === 'companies' && companies.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {item.logo && (item.logo.startsWith('http') || item.logo.startsWith('/')) ? (
                      <Image
                        src={item.logo}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain rounded-lg border"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-4xl">{item.logo || '🏢'}</span>
                    )}
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-xs text-gray-500">Order: {item.display_order}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeTab === 'talent-categories' && talentCategories.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.count} talents</p>
                      <p className="text-xs text-gray-500">Order: {item.display_order}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeTab === 'faqs' && faqs.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{item.question}</h3>
                    <p className="text-gray-700 mb-2">{item.answer}</p>
                    <p className="text-xs text-gray-500">Order: {item.display_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
