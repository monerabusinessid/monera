'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
interface Job {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  company: {
    name: string
  } | null
  skills: Array<{ id: string; name: string }>
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedRate: '',
  })

  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setJob(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch job:', error)
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    if (jobId) {
      fetchJob()
    }
  }, [jobId, fetchJob])

  const handleApply = async () => {
    setApplying(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jobId: jobId,
          coverLetter: applicationData.coverLetter,
          expectedRate: applicationData.expectedRate ? parseFloat(applicationData.expectedRate) : null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Application submitted successfully!')
        router.push('/user/applications')
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error applying:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Job not found</p>
          <Link href="/user/jobs">
            <Button className="mt-4">Back to Jobs</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/user/jobs">
        <Button variant="outline">← Back to Jobs</Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <CardDescription>
            {job.company?.name || 'Company not specified'}
            {job.location && ` • ${job.location}`}
            {job.remote && ' • Remote'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(job.salaryMin || job.salaryMax) && (
            <div>
              <p className="text-lg font-semibold text-purple-600">
                {job.salaryMin && job.salaryMax
                  ? `${job.salaryMin} - ${job.salaryMax} ${job.currency || 'USD'}`
                  : job.salaryMin
                  ? `${job.salaryMin}+ ${job.currency || 'USD'}`
                  : `Up to ${job.salaryMax} ${job.currency || 'USD'}`}
              </p>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {/* Application Form */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Apply for this Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expectedRate">Expected Rate (USD/hour)</Label>
                <Input
                  id="expectedRate"
                  type="number"
                  value={applicationData.expectedRate}
                  onChange={(e) => setApplicationData({ ...applicationData, expectedRate: e.target.value })}
                  placeholder="e.g., 50"
                />
              </div>
              <Button onClick={handleApply} disabled={applying || !applicationData.coverLetter}>
                {applying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
