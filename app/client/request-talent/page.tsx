'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export const runtime = 'edge'

export default function ClientRequestTalentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    company: '',
    talentType: '',
    budget: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  useEffect(() => {
    // Fetch user data to pre-fill form
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const user = data.data
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            clientName: user.fullName || user.name || '',
          }))
        }
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error)
      })
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/request-talent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitStatus({
          type: 'error',
          message: data.error || `Server error: ${response.status} ${response.statusText}`,
        })
        console.error('API Error:', data)
        return
      }

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.data?.message || 'Talent request submitted successfully! We will contact you soon.',
        })
        // Reset form
        setTimeout(() => {
          setFormData({
            clientName: '',
            email: '',
            company: '',
            talentType: '',
            budget: '',
            notes: '',
          })
          setSubmitStatus({ type: null, message: '' })
        }, 3000)
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to submit request. Please try again.',
        })
        if (data.errors) {
          console.error('Validation errors:', data.errors)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-headline">Request Talent</h1>
        <p className="text-gray-600 mt-1">Submit a custom talent request and we'll help you find the perfect match</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talent Request Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="talentType">Talent Type *</Label>
                <Input
                  id="talentType"
                  name="talentType"
                  type="text"
                  required
                  value={formData.talentType}
                  onChange={handleChange}
                  placeholder="e.g., Developer, Designer, Marketing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="text"
                  required
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g., 50000 or $50,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information about the talent request, requirements, timeline, etc..."
                rows={5}
              />
            </div>

            {submitStatus.type && (
              <div
                className={`p-4 rounded-md ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/client')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Submit Your Request</h3>
                <p className="text-sm text-gray-600">Fill out the form above with your talent requirements and budget.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">We Review Your Request</h3>
                <p className="text-sm text-gray-600">Our team will review your request and match you with suitable talent.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Get Matched</h3>
                <p className="text-sm text-gray-600">We'll contact you with potential matches and help you find the perfect talent.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
