// Helper functions for talent profile status management

export type ProfileStatus = 'DRAFT' | 'SUBMITTED' | 'NEED_REVISION' | 'APPROVED' | 'REJECTED'

export interface TalentProfileStatus {
  status: ProfileStatus
  revisionNotes?: string | null
  submittedAt?: string | null
}

/**
 * Check if user can access job pages
 */
export function canAccessJobs(status: ProfileStatus | null | undefined): boolean {
  // Allow access to jobs for SUBMITTED and APPROVED status
  return status === 'APPROVED' || status === 'SUBMITTED'
}

/**
 * Get status message for display
 */
export function getStatusMessage(status: ProfileStatus | null | undefined): {
  message: string
  description: string
  color: string
  bgColor: string
} {
  switch (status) {
    case 'DRAFT':
      return {
        message: 'Draft',
        description: 'Your profile is still being completed. Finish your profile to submit for review.',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
      }
    case 'SUBMITTED':
      return {
        message: 'Under Review',
        description: 'Your profile has been submitted and is being reviewed by the Monera team. The review process usually takes 24 hours or faster. You can explore available job openings while waiting for the review results.',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
      }
    case 'NEED_REVISION':
      return {
        message: 'Needs Revision',
        description: 'Your profile needs some updates. Please review the feedback and make the necessary changes.',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
      }
    case 'APPROVED':
      return {
        message: 'Approved',
        description: 'Your profile has been approved! You can now browse and apply to jobs.',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
      }
    case 'REJECTED':
      return {
        message: 'Rejected',
        description: 'Your profile was not approved. Please contact support for more information.',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
      }
    default:
      return {
        message: 'Unknown',
        description: 'Profile status is unknown. Please contact support.',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
      }
  }
}

/**
 * Get redirect path based on status
 */
export function getRedirectPath(status: ProfileStatus | null | undefined): string {
  switch (status) {
    case 'DRAFT':
      return '/user/onboarding'
    case 'SUBMITTED':
      return '/user/status'
    case 'NEED_REVISION':
      return '/user/status'
    case 'APPROVED':
      return '/user/jobs'
    case 'REJECTED':
      return '/user/status'
    default:
      return '/user/onboarding'
  }
}
