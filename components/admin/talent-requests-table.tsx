'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { updateTalentRequest, deleteTalentRequest } from '@/lib/actions/admin'

interface TalentRequest {
  id: string
  client_name: string
  email: string
  company: string | null
  talent_type: string
  budget: string
  notes: string | null
  created_at: string
  status?: string | null
}

interface TalentRequestsTableProps {
  requests: TalentRequest[]
}

export function TalentRequestsTable({ requests }: TalentRequestsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState<string | null>(null)

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredRequests = requests.filter((req) => {
    const matchesQuery =
      !normalizedQuery ||
      req.client_name.toLowerCase().includes(normalizedQuery) ||
      req.email.toLowerCase().includes(normalizedQuery) ||
      req.company?.toLowerCase().includes(normalizedQuery) ||
      req.talent_type.toLowerCase().includes(normalizedQuery)

    const matchesStatus = statusFilter === 'all' || (req.status || 'PENDING') === statusFilter
    return matchesQuery && matchesStatus
  })

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean)
    const initials = parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
    return initials || name.charAt(0).toUpperCase()
  }

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700'
    if (status === 'CONTACTED' || status === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700'
    if (status === 'CANCELLED') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const handleStatusChange = async (requestId: string, status: string) => {
    setLoading(requestId)
    const formData = new FormData()
    formData.append('requestId', requestId)
    formData.append('status', status)
    const result = await updateTalentRequest(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to update talent request')
    }
    setLoading(null)
  }

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this talent request? This action cannot be undone.')) return
    
    setLoading(requestId)
    const formData = new FormData()
    formData.append('requestId', requestId)
    const result = await deleteTalentRequest(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to delete talent request')
    }
    setLoading(null)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" />
            </svg>
          </span>
          <Input
            placeholder="Search by client name, email, company, or talent type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-gray-200 bg-white pl-11 shadow-sm"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-full border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 text-left">Requester</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Company</th>
              <th className="px-4 py-3 text-left">Talent Type</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Budget</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No talent requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const statusLabel = request.status || 'PENDING'
                return (
                  <tr key={request.id} className="text-sm text-gray-700">
                    <td className="bg-white px-4 py-4 shadow-sm rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/10 text-sm font-semibold text-brand-purple">
                          {getInitials(request.client_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.client_name}</p>
                          <p className="text-xs text-gray-500">{request.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="bg-white px-4 py-4 shadow-sm hidden md:table-cell">
                      {request.company || 'N/A'}
                    </td>
                    <td className="bg-white px-4 py-4 shadow-sm">
                      {request.talent_type}
                    </td>
                    <td className="bg-white px-4 py-4 shadow-sm hidden md:table-cell">
                      {request.budget}
                    </td>
                    <td className="bg-white px-4 py-4 shadow-sm">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(statusLabel)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {statusLabel.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="bg-white px-4 py-4 shadow-sm text-xs text-gray-500 hidden lg:table-cell">
                      {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="bg-white px-4 py-4 shadow-sm rounded-r-2xl">
                      <div className="flex justify-end gap-2">
                        <select
                          value={statusLabel}
                          onChange={(e) => handleStatusChange(request.id, e.target.value)}
                          disabled={loading === request.id}
                          className="h-9 rounded-full border border-gray-200 bg-white px-3 text-xs text-gray-700"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(request.id)}
                          disabled={loading === request.id}
                          className="text-red-600 hover:text-red-700"
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
    </div>
  )
}
