'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { approveTalent, rejectTalent, suspendUser, unsuspendUser } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Talent {
  id: string
  user_id: string
  email: string | null
  headline: string | null
  bio: string | null
  hourly_rate: number | null
  portfolio_url: string | null
  availability: string
  profile_completion: number
  is_profile_ready: boolean
  status: string // PENDING, APPROVED, REJECTED
  last_validated_at: string | null
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    status: string
    role: string
  } | null
}

interface TalentReviewTableProps {
  talents: Talent[]
}

export function TalentReviewTable({ talents }: TalentReviewTableProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleApprove = async (talentId: string) => {
    setLoading(talentId)
    const formData = new FormData()
    formData.append('talentId', talentId)
    const result = await approveTalent(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to approve talent')
    }
    setLoading(null)
  }

  const handleReject = async (talentId: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setLoading(talentId)
    const formData = new FormData()
    formData.append('talentId', talentId)
    formData.append('reason', reason)
    const result = await rejectTalent(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to reject talent')
    }
    setLoading(null)
  }

  const handleSuspend = async (userId: string) => {
    const reason = prompt('Enter suspension reason:')
    if (!reason) return

    setLoading(userId)
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('reason', reason)
    const result = await suspendUser(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to suspend user')
    }
    setLoading(null)
  }

  const handleUnsuspend = async (userId: string) => {
    setLoading(userId)
    const formData = new FormData()
    formData.append('userId', userId)
    const result = await unsuspendUser(formData)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to unsuspend user')
    }
    setLoading(null)
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredTalents = talents.filter((talent) => {
    const name = talent.profiles?.full_name || ''
    const headline = talent.headline || ''
    const email = talent.email || ''
    const statusLabel = talent.is_profile_ready ? 'READY' : talent.status === 'REJECTED' ? 'REJECTED' : 'PENDING'

    const matchesQuery =
      !normalizedQuery ||
      name.toLowerCase().includes(normalizedQuery) ||
      headline.toLowerCase().includes(normalizedQuery) ||
      email.toLowerCase().includes(normalizedQuery) ||
      statusLabel.toLowerCase().includes(normalizedQuery)

    const matchesStatus = statusFilter === 'all' || statusLabel === statusFilter
    return matchesQuery && matchesStatus
  })

  const getInitials = (name?: string | null) => {
    if (!name) return 'T'
    const parts = name.split(' ').filter(Boolean)
    const initials = parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
    return initials || name.charAt(0).toUpperCase()
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
            placeholder="Search talent by name or headline..."
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
            <option value="READY">Ready</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
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
            <th className="px-4 py-3 text-left">Talent</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Completion</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">User Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTalents.map((talent) => {
            const statusLabel = talent.is_profile_ready ? 'Ready' : talent.status === 'REJECTED' ? 'Rejected' : 'Pending'
            const statusStyle = talent.is_profile_ready
              ? 'bg-green-100 text-green-700'
              : talent.status === 'REJECTED'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'

            return (
              <tr key={talent.id} className="text-sm text-gray-700">
                <td className="bg-white px-4 py-4 shadow-sm rounded-l-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/10 text-sm font-semibold text-brand-purple">
                      {getInitials(talent.profiles?.full_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{talent.profiles?.full_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{talent.email || talent.headline || 'No email'}</p>
                    </div>
                  </div>
                </td>
                <td className="bg-white px-4 py-4 shadow-sm hidden md:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand-purple"
                        style={{ width: `${talent.profile_completion}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{talent.profile_completion.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="bg-white px-4 py-4 shadow-sm">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {statusLabel}
                  </span>
                </td>
                <td className="bg-white px-4 py-4 shadow-sm hidden md:table-cell">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                      talent.profiles?.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : talent.profiles?.status === 'SUSPENDED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {talent.profiles?.status || 'N/A'}
                  </span>
                </td>
                <td className="bg-white px-4 py-4 shadow-sm rounded-r-2xl">
                  <div className="flex justify-end flex-wrap gap-2">
                    {!talent.id.startsWith('incomplete-') && (
                      <Link href={`/admin/talent-review/${talent.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </Link>
                    )}
                    {!talent.id.startsWith('incomplete-') && !talent.is_profile_ready && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(talent.id)}
                        disabled={loading === talent.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                    )}
                    {!talent.id.startsWith('incomplete-') && talent.is_profile_ready && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(talent.id)}
                        disabled={loading === talent.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                    )}
                    {talent.id.startsWith('incomplete-') && (
                      <span className="text-xs text-gray-500">Profile incomplete</span>
                    )}
                    {talent.profiles?.status === 'ACTIVE' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSuspend(talent.user_id)}
                        disabled={loading === talent.user_id}
                        className="text-red-600 hover:text-red-700"
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnsuspend(talent.user_id)}
                        disabled={loading === talent.user_id}
                      >
                        Unsuspend
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {filteredTalents.length === 0 && (
        <div className="text-center py-8 text-gray-500">No talents found</div>
      )}
      </div>
    </div>
  )
}
