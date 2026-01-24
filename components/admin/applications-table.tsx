'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateApplication, deleteApplication } from '@/lib/actions/admin'

interface Application {
  id: string
  status: string
  created_at: string
  jobs: {
    id: string
    title: string
    status: string
    recruiter_profiles: {
      id: string
      full_name: string | null
    } | null
  } | null
  talent_profiles: {
    id: string
    profiles: {
      id: string
      email: string
      full_name: string | null
    } | null
  } | null
}

interface ApplicationsTableProps {
  applications: Application[]
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredApplications = applications.filter(
    (app) => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesSearch = 
        app.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.talent_profiles?.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.talent_profiles?.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    }
  )

  const handleStatusChange = async (applicationId: string, status: string) => {
    setLoading(applicationId)
    const formData = new FormData()
    formData.append('applicationId', applicationId)
    formData.append('status', status)
    const result = await updateApplication(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to update application')
    }
    setLoading(null)
  }

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) return
    
    setLoading(applicationId)
    const formData = new FormData()
    formData.append('applicationId', applicationId)
    const result = await deleteApplication(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to delete application')
    }
    setLoading(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-700'
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search by job title, candidate name, or email..."
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
          <option value="PENDING">Pending</option>
          <option value="REVIEWING">Reviewing</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Job Title</th>
              <th className="text-left p-4">Candidate</th>
              <th className="text-left p-4">Recruiter</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Applied</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No applications found
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr key={app.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    {app.jobs?.title || 'N/A'}
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">
                        {app.talent_profiles?.profiles?.full_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.talent_profiles?.profiles?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {app.jobs?.recruiter_profiles?.full_name || 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={loading === app.id}
                        className="px-2 py-1 text-xs border rounded"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(app.id)}
                        disabled={loading === app.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
