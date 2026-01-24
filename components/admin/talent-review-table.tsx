'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { approveTalent, rejectTalent, suspendUser, unsuspendUser } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Talent {
  id: string
  user_id: string
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4 hidden md:table-cell">Headline</th>
            <th className="text-left p-4 hidden sm:table-cell">Completion</th>
            <th className="text-left p-4 hidden sm:table-cell">Status</th>
            <th className="text-left p-4 hidden md:table-cell">User Status</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {talents.map((talent) => (
            <tr key={talent.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                {talent.profiles?.full_name || 'N/A'}
              </td>
              <td className="p-4 hidden md:table-cell">{talent.headline || '-'}</td>
              <td className="p-4 hidden sm:table-cell">
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-brand-purple h-2 rounded-full"
                      style={{ width: `${talent.profile_completion}%` }}
                    />
                  </div>
                  <span className="text-sm">{talent.profile_completion.toFixed(0)}%</span>
                </div>
              </td>
              <td className="p-4 hidden sm:table-cell">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    talent.is_profile_ready
                      ? 'bg-green-100 text-green-800'
                      : talent.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {talent.is_profile_ready ? 'Ready' : talent.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                </span>
              </td>
              <td className="p-4 hidden md:table-cell">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    talent.profiles?.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : talent.profiles?.status === 'SUSPENDED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {talent.profiles?.status || 'N/A'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  {!talent.id.startsWith('incomplete-') && (
                    <Link href={`/admin/talent-review/${talent.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  )}
                  {!talent.id.startsWith('incomplete-') && !talent.is_profile_ready && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(talent.id)}
                      disabled={loading === talent.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  )}
                  {!talent.id.startsWith('incomplete-') && talent.is_profile_ready && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(talent.id)}
                      disabled={loading === talent.id}
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
                      variant="destructive"
                      onClick={() => handleSuspend(talent.user_id)}
                      disabled={loading === talent.user_id}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnsuspend(talent.user_id)}
                      disabled={loading === talent.user_id}
                    >
                      Unsuspend
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {talents.length === 0 && (
        <div className="text-center py-8 text-gray-500">No talents found</div>
      )}
    </div>
  )
}
