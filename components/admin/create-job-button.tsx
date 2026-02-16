'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { JobModal } from './job-modal'

interface CreateJobButtonProps {
  className?: string
  label?: string
}

export function CreateJobButton({ className, label = 'Add Job' }: CreateJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={className}>
        + {label}
      </Button>
      <JobModal
        job={null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
      />
    </>
  )
}
