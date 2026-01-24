'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { JobModal } from './job-modal'

export function CreateJobButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Add New Job</Button>
      <JobModal
        job={null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
      />
    </>
  )
}
