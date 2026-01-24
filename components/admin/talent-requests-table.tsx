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
}

interface TalentRequestsTableProps {
  requests: TalentRequest[]
}

export function TalentRequestsTable({ requests }: TalentRequestsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredRequests = requests.filter(
    (req) =>
      req.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.talent_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="mb-6">
        <Input
          placeholder="Search by client name, email, company, or talent type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No talent requests found</div>
        ) : (
          filteredRequests.map((request) => (
          <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{request.client_name}</h3>
                <p className="text-sm text-gray-600">{request.email}</p>
                {request.company && (
                  <p className="text-sm text-gray-600">Company: {request.company}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Talent Type</p>
                <p className="text-sm text-gray-900">{request.talent_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Budget</p>
                <p className="text-sm text-gray-900">{request.budget}</p>
              </div>
            </div>
            {request.notes && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                <p className="text-sm text-gray-600">{request.notes}</p>
              </div>
            )}
            <div className="flex gap-2">
              <select
                value={(request as any).status || 'PENDING'}
                onChange={(e) => handleStatusChange(request.id, e.target.value)}
                disabled={loading === request.id}
                className="px-3 py-1 text-sm border rounded"
              >
                <option value="PENDING">Pending</option>
                <option value="CONTACTED">Contacted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(request.id)}
                disabled={loading === request.id}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  )
}
