'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SkillModal } from './skill-modal'

export function CreateSkillButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>+ Add New Skill</Button>
      <SkillModal
        skill={null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
      />
    </>
  )
}
