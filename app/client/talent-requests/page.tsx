'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
export const runtime = 'edge'

interface TalentRequest {
  id: string
  clientName: string
  email: string
  company: string | null
  talentType: string
  budget: string
  notes: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function ClientTalentRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<TalentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastFetch, setLastFetch] = useState(Date.now())

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch('/api/talent-requests', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setRequests(data.data.talentRequests || [])
      }
    } catch (error) {
      console.error('Failed to fetch talent requests:', error)
    } finally {
      setLoading(false)
      setLastFetch(Date.now())
    }
  }, [])

  useEffect(() => {
    fetchRequests()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRequests()
    }, 30000)

    // Refresh when window regains focus
    const handleFocus = () => {
      fetchRequests()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchRequests])

  const refreshData = useCallback(() => {
    setLoading(true)
    fetchRequests()
  }, [fetchRequests])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed'
      case 'PROCESSING':
        return 'Processing'
      case 'PENDING':
        return 'Pending'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.talentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    processing: requests.filter((r) => r.status === 'PROCESSING').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
  }

  if (loading && requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Loading talent requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-headline">My Talent Requests</h1>
          <p className="text-gray-600 mt-1">Track the status of your talent requests</p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetch > 0 && (
            <span className="text-xs text-gray-500 hidden md:block">
              Last updated: {new Date(lastFetch).toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-purple">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            type="text"
            placeholder="Search requests by name, talent type, company, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No talent requests found</h3>
              <p className="mt-2 text-gray-500">
                {requests.length === 0
                  ? "You haven't submitted any talent requests yet. Submit your first request to get started!"
                  : 'No requests match your search criteria.'}
              </p>
              {requests.length === 0 && (
                <div className="mt-4">
                  <Button
                    onClick={() => router.push('/client/request-talent')}
                    className="bg-brand-purple hover:bg-purple-700"
                  >
                    Submit Talent Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{request.talentType}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Client:</span>
                        <span>{request.clientName}</span>
                      </div>
                      {request.company && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Company:</span>
                          <span>{request.company}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Budget:</span>
                        <span>{request.budget}</span>
                      </div>
                      {request.notes && (
                        <div className="mt-3">
                          <span className="font-medium">Notes:</span>
                          <p className="text-gray-600 mt-1">{request.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Submitted {formatDate(request.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
