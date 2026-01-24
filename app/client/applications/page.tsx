'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Application {
  id: string
  status: string
  coverLetter: string | null
  expectedRate: number | null
  createdAt: string
  job: {
    id: string
    title: string
    company: {
      name: string
    } | null
  } | null
  talent: {
    id: string
    full_name: string | null
    email?: string
  } | null
}

export default function ClientApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [lastFetch, setLastFetch] = useState(Date.now())

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('/api/applications?recruiterId=me&limit=100', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setApplications(data.data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
      setLastFetch(Date.now())
    }
  }, [])

  useEffect(() => {
    fetchApplications()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchApplications()
    }, 30000)

    // Refresh when window regains focus
    const handleFocus = () => {
      fetchApplications()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchApplications])

  const refreshData = useCallback(() => {
    setLoading(true)
    fetchApplications()
  }, [fetchApplications])

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
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-700'
      case 'REVIEWING':
        return 'bg-yellow-100 text-yellow-700'
      case 'PENDING':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh applications after update
        fetchApplications()
      } else {
        alert(data.error || 'Failed to update application status')
      }
    } catch (error) {
      console.error('Failed to update application status:', error)
      alert('Failed to update application status')
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.talent?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.talent?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    shortlisted: applications.filter((a) => a.status === 'SHORTLISTED').length,
    accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  }

  if (loading && applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-headline">Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage job applications</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
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
            <div className="text-3xl font-bold text-gray-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.shortlisted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by job title, talent name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-brand-purple' : ''}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
                className={statusFilter === 'PENDING' ? 'bg-brand-purple' : ''}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'SHORTLISTED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('SHORTLISTED')}
                className={statusFilter === 'SHORTLISTED' ? 'bg-brand-purple' : ''}
                size="sm"
              >
                Shortlisted
              </Button>
              <Button
                variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('ACCEPTED')}
                className={statusFilter === 'ACCEPTED' ? 'bg-brand-purple' : ''}
                size="sm"
              >
                Accepted
              </Button>
              <Button
                variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('REJECTED')}
                className={statusFilter === 'REJECTED' ? 'bg-brand-purple' : ''}
                size="sm"
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
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
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No applications found</h3>
              <p className="mt-2 text-gray-500">
                {applications.length === 0
                  ? "You haven't received any applications yet. Applications will appear here when talent applies to your jobs."
                  : 'No applications match your search criteria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link href={`/jobs/${app.job?.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-brand-purple">
                          {app.job?.title || 'Job not found'}
                        </h3>
                      </Link>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="font-medium">
                          {app.talent?.full_name || app.talent?.email || 'Unknown Talent'}
                        </span>
                        {app.talent?.email && (
                          <span className="text-gray-500">({app.talent.email})</span>
                        )}
                      </div>
                      {app.job?.company && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          {app.job.company.name}
                        </div>
                      )}
                      {app.expectedRate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Expected Rate: ${app.expectedRate.toLocaleString()}/hour
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Applied {formatDate(app.createdAt)}
                      </div>
                    </div>
                    {app.coverLetter && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-3">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {app.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'SHORTLISTED')}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === 'SHORTLISTED' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'ACCEPTED')}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Link href={`/jobs/${app.job?.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Job
                      </Button>
                    </Link>
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
