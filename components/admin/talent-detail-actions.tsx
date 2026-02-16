'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { approveTalent, rejectTalent } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface TalentDetailActionsProps {
  talentId: string
  currentStatus: string
}

export default function TalentDetailActions({ talentId, currentStatus }: TalentDetailActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this talent?')) return

    setLoading(true)
    const formData = new FormData()
    formData.append('talentId', talentId)
    const result = await approveTalent(formData)
    
    if (result.success) {
      router.refresh()
      alert('Talent approved successfully!')
    } else {
      alert(result.error || 'Failed to approve talent')
    }
    setLoading(false)
  }

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setLoading(true)
    const formData = new FormData()
    formData.append('talentId', talentId)
    formData.append('reason', reason)
    const result = await rejectTalent(formData)
    
    if (result.success) {
      router.refresh()
      alert('Talent rejected successfully!')
    } else {
      alert(result.error || 'Failed to reject talent')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {currentStatus !== 'REJECTED' && (
        <Button
          onClick={handleReject}
          disabled={loading}
          variant="outline"
          className="rounded-full border-red-200 px-5 text-red-600 hover:bg-red-50"
        >
          Reject Request
        </Button>
      )}
      {currentStatus !== 'APPROVED' && (
        <Button
          onClick={handleApprove}
          disabled={loading}
          className="rounded-full bg-brand-purple px-5 text-white shadow-sm hover:bg-brand-purple/90"
        >
          Approve Talent
        </Button>
      )}
    </div>
  )
}
