'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SkillModal } from './skill-modal'

interface CreateSkillButtonProps {
  className?: string
  label?: string
}

export function CreateSkillButton({ className, label = 'Add Skill' }: CreateSkillButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={className}>
        + {label}
      </Button>
      <SkillModal
        skill={null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
      />
    </>
  )
}
