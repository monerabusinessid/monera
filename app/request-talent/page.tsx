'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function RequestTalentPage() {
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
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle HTTP errors
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
          message: data.data?.message || 'Talent request submitted successfully!',
        })
        // Reset form
        setFormData({
          clientName: '',
          email: '',
          company: '',
          talentType: '',
          budget: '',
          notes: '',
        })
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
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Request Talent</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information about the talent request..."
            rows={5}
          />
        </div>

        {submitStatus.type && (
          <div
            className={`p-4 rounded-md ${
              submitStatus.type === 'success'
                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}
