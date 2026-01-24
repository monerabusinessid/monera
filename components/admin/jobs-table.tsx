'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateJobStatus, deleteJob } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { JobModal } from './job-modal'

interface Job {
  id: string
  title: string
  description: string
  requirements?: string | null
  location: string | null
  remote: boolean
  salary_min?: number | null
  salary_max?: number | null
  currency: string | null
  status: string
  created_at?: string
  updated_at?: string
  published_at?: string | null
  recruiter_id?: string
  company_id?: string | null
  profiles?: {
    id: string
    full_name: string | null
  } | null
  company?: {
    id: string
    name: string
  } | null
}

interface JobsTableProps {
  jobs: Job[]
}

export function JobsTable({ jobs }: JobsTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Debug: Log jobs received
  console.log('JobsTable received jobs:', jobs?.length || 0, jobs)

  const filteredJobs = (jobs || []).filter(
    (job) => {
      if (!job) return false
      
      const recruiterName = job.profiles?.full_name || ''
      
      const matchesSearch =
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      
      return matchesSearch && matchesStatus
    }
  )

  const handleStatusChange = async (jobId: string, status: string) => {
    setLoading(jobId)
    const formData = new FormData()
    formData.append('jobId', jobId)
    formData.append('status', status)
    const result = await updateJobStatus(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to update job status')
    }
    setLoading(null)
  }

  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return
    }
    
    setLoading(jobId)
    const formData = new FormData()
    formData.append('jobId', jobId)
    const result = await deleteJob(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to delete job')
    }
    setLoading(null)
  }

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search jobs by title, recruiter, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="PUBLISHED">Active (Published)</option>
          <option value="DRAFT">Draft</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Title</th>
            <th className="text-left p-4">Recruiter</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Created</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredJobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center text-gray-500">
                No jobs found
              </td>
            </tr>
          ) : (
            filteredJobs.map((job) => {
              const salaryMin = job.salary_min
              const salaryMax = job.salary_max
              const createdAt = job.created_at
              const recruiterName = job.company?.name || job.profiles?.full_name || 'N/A'
              const companyName = job.company?.name || null
              
              return (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-semibold">{job.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      📍 {job.remote ? recruiterName : job.location || '—'} {job.remote && '• Remote'}
                    </div>
                    {(salaryMin || salaryMax) && (
                      <div className="text-xs text-gray-500 mt-1">
                        💰 {salaryMin ? `${job.currency || 'USD'} ${salaryMin.toLocaleString()}` : ''}
                        {salaryMin && salaryMax ? ' - ' : ''}
                        {salaryMax ? `${job.currency || 'USD'} ${salaryMax.toLocaleString()}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{recruiterName}</div>
                    {companyName && (
                      <div className="text-xs text-gray-500 mt-1">{companyName}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        job.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job)
                          setModalMode('view')
                          setIsModalOpen(true)
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedJob(job)
                          setModalMode('edit')
                          setIsModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      {job.status !== 'PUBLISHED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                          disabled={loading === job.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id, job.title)}
                        disabled={loading === job.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      </div>

      <JobModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedJob(null)
        }}
        mode={modalMode}
      />
    </div>
  )
}
